import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  setDoc,
  increment,
  serverTimestamp,
  limit,
  writeBatch,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  auth,
  db,
  functions,
  handleFirestoreError,
  OperationType,
} from './app';
import {
  parseUserAgent,
  getVisitorId,
  isBot,
  shouldRecordPageView,
  analyticsStreamEngine,
  TelemetryEvent,
  formatCountryLabel,
} from '../analytics';
import { SpecializedAnalyticsSummary } from '../../types';

// Wire up the high-throughput analytics stream engine dispatcher
if (typeof window !== 'undefined') {
  analyticsStreamEngine.setDispatcher(async (events: TelemetryEvent[]) => {
    if (!events || events.length === 0) return;

    // 1. Primary Strategy: Try Cloud Functions high-throughput batch callable
    try {
      const ingestFn = httpsCallable(functions, 'ingestAnalyticsBatchCallable');
      await ingestFn({ events });
      return;
    } catch {
      // If callable fails (e.g. offline, local dev emulator without functions), proceed to fallback
    }

    // 2. Secondary Strategy: Direct atomic batch write to Firestore (O(1) commit instead of N separate operations)
    try {
      const batch = writeBatch(db);
      const rollups = new Map<string, { views: number; clicks: number; devices: Record<string, number>; linkClicks: Record<string, number> }>();
      const linkClicksMap = new Map<string, { pageId: string; linkId: string; count: number }>();

      for (const ev of events) {
        if (!ev || !ev.pageId) continue;
        const dateKey = new Date(ev.timestamp).toISOString().split('T')[0];
        const key = `${ev.pageId}::${dateKey}`;
        let r = rollups.get(key);
        if (!r) {
          r = { views: 0, clicks: 0, devices: {}, linkClicks: {} };
          rollups.set(key, r);
        }

        if (ev.type === 'page_view') {
          r.views += 1;
        } else if (ev.type === 'link_click') {
          r.clicks += 1;
          if (ev.linkId) {
            r.linkClicks[ev.linkId] = (r.linkClicks[ev.linkId] || 0) + 1;
            const lKey = `${ev.pageId}::${ev.linkId}`;
            const ex = linkClicksMap.get(lKey);
            if (ex) ex.count += 1;
            else linkClicksMap.set(lKey, { pageId: ev.pageId, linkId: ev.linkId, count: 1 });
          }
        }
        r.devices[ev.device] = (r.devices[ev.device] || 0) + 1;
      }

      for (const [key, r] of rollups.entries()) {
        const [pageId, dateKey] = key.split('::');
        const statsRef = doc(db, 'pages', pageId, 'stats', dateKey);
        const updates: Record<string, any> = {
          date: dateKey,
          updatedAt: serverTimestamp(),
        };
        if (r.views > 0) updates.views = increment(r.views);
        if (r.clicks > 0) updates.clicks = increment(r.clicks);
        for (const [dev, c] of Object.entries(r.devices)) {
          updates[`devices.${dev}`] = increment(c);
        }
        for (const [lId, c] of Object.entries(r.linkClicks)) {
          updates[`linkClicks.${lId}`] = increment(c);
        }
        batch.set(statsRef, updates, { merge: true });
      }

      for (const linkEntry of linkClicksMap.values()) {
        const linkRef = doc(db, 'pages', linkEntry.pageId, 'links', linkEntry.linkId);
        batch.set(linkRef, { clickCount: increment(linkEntry.count) }, { merge: true });
      }

      await batch.commit();
    } catch (fallbackErr) {
      console.warn('[analytics] Direct batch write notice:', fallbackErr);
      throw fallbackErr;
    }
  });
}

export const analyticsService = {
  // Record page view event via high-throughput stream buffer
  // STRICT: Only genuine external visitor events are tracked.
  // Studio live previews and owner testing are strictly excluded.
  async recordView(pageId: string): Promise<void> {
    if (!pageId) return;

    // Strict owner/admin exclusion: Never track owner viewing their own profile
    if (auth.currentUser && auth.currentUser.uid === pageId) {
      return;
    }

    if (typeof navigator !== 'undefined' && isBot(navigator.userAgent)) {
      return;
    }

    if (!shouldRecordPageView(pageId)) {
      return;
    }

    const visitorId = getVisitorId();
    const uaInfo = typeof navigator !== 'undefined' ? parseUserAgent(navigator.userAgent) : { device: 'desktop' as const, browser: 'unknown' };
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    const event: TelemetryEvent = {
      type: 'page_view',
      pageId,
      linkId: null,
      visitorId,
      device: uaInfo.device,
      browser: uaInfo.browser,
      referrer,
      country: 'GLOBAL',
      timestamp: Date.now(),
    };

    analyticsStreamEngine.enqueue(event);
  },

  // Record link click event via high-throughput stream buffer
  // STRICT: Only genuine external visitor clicks are tracked.
  // Studio live previews and owner clicks are strictly excluded.
  async recordClick(pageId: string, linkId: string): Promise<void> {
    if (!pageId || !linkId) return;

    // Strict owner/admin exclusion: Never track owner testing their own cards
    if (auth.currentUser && auth.currentUser.uid === pageId) {
      return;
    }

    if (typeof navigator !== 'undefined' && isBot(navigator.userAgent)) {
      return;
    }

    const visitorId = getVisitorId();
    const uaInfo = typeof navigator !== 'undefined' ? parseUserAgent(navigator.userAgent) : { device: 'desktop' as const, browser: 'unknown' };
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    const event: TelemetryEvent = {
      type: 'link_click',
      pageId,
      linkId,
      visitorId,
      device: uaInfo.device,
      browser: uaInfo.browser,
      referrer,
      country: 'GLOBAL',
      timestamp: Date.now(),
    };

    analyticsStreamEngine.enqueue(event);
  },

  // Record custom conversion events (leads, bookings, valuations)
  async recordConversion(pageId: string, conversionType: string, linkId?: string | null): Promise<void> {
    if (!pageId || !conversionType) return;
    if (auth.currentUser && auth.currentUser.uid === pageId) return;
    if (typeof navigator !== 'undefined' && isBot(navigator.userAgent)) return;

    const visitorId = getVisitorId();
    const uaInfo = typeof navigator !== 'undefined' ? parseUserAgent(navigator.userAgent) : { device: 'desktop' as const, browser: 'unknown' };
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    analyticsStreamEngine.enqueue({
      type: conversionType,
      pageId,
      linkId: linkId || null,
      visitorId,
      device: uaInfo.device,
      browser: uaInfo.browser,
      referrer,
      country: 'GLOBAL',
      timestamp: Date.now(),
    });
  },

  // Query aggregated rollups from pre-computed daily buckets in pages/{pageId}/stats
  // with O(days) efficiency, zero document write contention, and automatic legacy fallback.
  async getAnalyticsSummary(pageId: string, days = 30): Promise<SpecializedAnalyticsSummary> {
    const targetPageId = pageId || auth.currentUser?.uid;
    const defaultSummary: SpecializedAnalyticsSummary = {
      totalViews: 0,
      totalClicks: 0,
      ctr: '0.0',
      overallCtr: 0,
      propertyViews: 0,
      showingRequests: 0,
      homeValuations: 0,
      brandInquiries: 0,
      mediaKitDownloads: 0,
      packageClicks: 0,
      packageBookings: 0,
      generalContacts: 0,
      musicBookings: 0,
      podcastSponsorships: 0,
      estimatedPipelineValueINR: 0,
      deviceCounts: { mobile: 0, desktop: 0, tablet: 0 },
      browserCounts: {},
      referrerCounts: {},
      locationCounts: {},
      linkClickCounts: {},
      topLinks: [],
      dailyStats: [],
    };

    if (!targetPageId) return defaultSummary;

    try {
      // 1. Fetch page metadata for reset cutoff and card display labels
      let resetCutoffMs = 0;
      try {
        const pageDocSnap = await getDoc(doc(db, 'pages', targetPageId));
        if (pageDocSnap.exists()) {
          const pData = pageDocSnap.data();
          if (pData.analyticsResetAt) {
            const rTs = pData.analyticsResetAt;
            resetCutoffMs = typeof rTs.toMillis === 'function'
              ? rTs.toMillis()
              : typeof rTs.toDate === 'function'
              ? rTs.toDate().getTime()
              : new Date(rTs).getTime();
          }
        }
      } catch {
        // ignore
      }

      const daysCutoffMs = Date.now() - (days * 24 * 60 * 60 * 1000);
      const effectiveCutoffMs = Math.max(daysCutoffMs, resetCutoffMs);
      const startDateStr = new Date(effectiveCutoffMs).toISOString().split('T')[0];

      // Fetch card details (titles, urls, colors) for top links display
      const linkDetails: Record<string, { title: string; url: string; color: string }> = {};
      try {
        const linksRef = collection(db, 'pages', targetPageId, 'links');
        const linksSnap = await getDocs(linksRef);
        linksSnap.forEach((lDoc) => {
          const lData = lDoc.data();
          linkDetails[lDoc.id] = {
            title: lData.title || '',
            url: lData.url || lData.link_url || '',
            color: lData.color || 'purple',
          };
        });
      } catch {
        // ignore
      }

      // 2. Primary Read Model: Pre-Aggregated Daily Rollups from pages/{targetPageId}/stats
      let totalViews = 0;
      let totalClicks = 0;
      let propertyViews = 0;
      let showingRequests = 0;
      let homeValuations = 0;
      let brandInquiries = 0;
      let mediaKitDownloads = 0;
      let packageBookings = 0;
      let generalContacts = 0;
      let musicBookings = 0;
      let podcastSponsorships = 0;

      const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
      const browserCounts: Record<string, number> = {};
      const referrerCounts: Record<string, number> = {};
      const rawCountryCounts: Record<string, number> = {};
      const linkClickCounts: Record<string, number> = {};
      const dailyMap: Record<string, { views: number; clicks: number }> = {};

      const statsRef = collection(db, 'pages', targetPageId, 'stats');
      const statsQuery = query(statsRef, where('date', '>=', startDateStr));
      const statsSnap = await getDocs(statsQuery);

      if (!statsSnap.empty) {
        statsSnap.forEach((docSnap) => {
          const sData = docSnap.data();
          const dKey = sData.date || docSnap.id;
          const v = Number(sData.views || 0);
          const c = Number(sData.clicks || 0);

          totalViews += v;
          totalClicks += c;

          if (!dailyMap[dKey]) dailyMap[dKey] = { views: 0, clicks: 0 };
          dailyMap[dKey].views += v;
          dailyMap[dKey].clicks += c;

          // Conversions & event types
          if (sData.eventTypes && typeof sData.eventTypes === 'object') {
            propertyViews += Number(sData.eventTypes.property_view || 0);
            showingRequests += Number(sData.eventTypes.showing_request || 0);
            homeValuations += Number(sData.eventTypes.home_valuation || 0);
            brandInquiries += Number(sData.eventTypes.brand_inquiry || 0);
            mediaKitDownloads += Number(sData.eventTypes.media_kit_download || 0);
            packageBookings += Number(sData.eventTypes.package_booking || 0);
            generalContacts += Number(sData.eventTypes.general_contact || 0);
            musicBookings += Number(sData.eventTypes.music_booking || 0);
            podcastSponsorships += Number(sData.eventTypes.podcast_sponsorship || 0);
          }

          // Devices
          if (sData.devices && typeof sData.devices === 'object') {
            for (const [dev, count] of Object.entries(sData.devices)) {
              const dLower = dev.toLowerCase();
              if (dLower === 'mobile' || dLower === 'desktop' || dLower === 'tablet') {
                deviceCounts[dLower] = (deviceCounts[dLower] || 0) + Number(count || 0);
              }
            }
          }

          // Browsers
          if (sData.browsers && typeof sData.browsers === 'object') {
            for (const [br, count] of Object.entries(sData.browsers)) {
              browserCounts[br] = (browserCounts[br] || 0) + Number(count || 0);
            }
          }

          // Referrers
          if (sData.referrers && typeof sData.referrers === 'object') {
            for (const [ref, count] of Object.entries(sData.referrers)) {
              referrerCounts[ref] = (referrerCounts[ref] || 0) + Number(count || 0);
            }
          }

          // Countries
          if (sData.countries && typeof sData.countries === 'object') {
            for (const [country, count] of Object.entries(sData.countries)) {
              rawCountryCounts[country] = (rawCountryCounts[country] || 0) + Number(count || 0);
            }
          }

          // Link Clicks
          if (sData.linkClicks && typeof sData.linkClicks === 'object') {
            for (const [lId, count] of Object.entries(sData.linkClicks)) {
              linkClickCounts[lId] = (linkClickCounts[lId] || 0) + Number(count || 0);
            }
          }
        });
      } else {
        // 3. Fallback Model: Read from pages/{targetPageId}/analytics if daily rollups not yet present
        try {
          const rawRef = collection(db, 'pages', targetPageId, 'analytics');
          const rawSnap = await getDocs(query(rawRef, limit(1000)));

          rawSnap.forEach((d) => {
            const data = d.data();
            const eventType = data.type;
            let eventTs = 0;
            let dateKey = '';
            try {
              const ts = data.timestamp
                ? typeof data.timestamp.toMillis === 'function'
                  ? data.timestamp.toMillis()
                  : typeof data.timestamp.toDate === 'function'
                  ? data.timestamp.toDate().getTime()
                  : new Date(data.timestamp).getTime()
                : Date.now();
              eventTs = ts;
              dateKey = new Date(ts).toISOString().split('T')[0];
            } catch {
              eventTs = Date.now();
              dateKey = new Date().toISOString().split('T')[0];
            }

            if (effectiveCutoffMs > 0 && eventTs < effectiveCutoffMs) return;

            if (!dailyMap[dateKey]) dailyMap[dateKey] = { views: 0, clicks: 0 };

            if (eventType === 'page_view') {
              totalViews += 1;
              dailyMap[dateKey].views += 1;
            } else if (eventType === 'link_click') {
              totalClicks += 1;
              dailyMap[dateKey].clicks += 1;
              if (data.linkId && typeof data.linkId === 'string') {
                linkClickCounts[data.linkId] = (linkClickCounts[data.linkId] || 0) + 1;
              }
            } else if (eventType === 'property_view') propertyViews += 1;
            else if (eventType === 'showing_request') showingRequests += 1;
            else if (eventType === 'home_valuation') homeValuations += 1;
            else if (eventType === 'brand_inquiry') brandInquiries += 1;
            else if (eventType === 'media_kit_download') mediaKitDownloads += 1;
            else if (eventType === 'package_booking') packageBookings += 1;
            else if (eventType === 'general_contact') generalContacts += 1;
            else if (eventType === 'music_booking') musicBookings += 1;
            else if (eventType === 'podcast_sponsorship') podcastSponsorships += 1;

            if (data.device) {
              const dev = String(data.device).toLowerCase();
              if (dev === 'mobile' || dev === 'desktop' || dev === 'tablet') {
                deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
              }
            }
            if (data.browser) {
              browserCounts[String(data.browser)] = (browserCounts[String(data.browser)] || 0) + 1;
            }
            if (data.referrer) {
              let ref = String(data.referrer);
              try {
                if (ref.startsWith('http')) ref = new URL(ref).hostname.replace(/^www\./, '');
              } catch {}
              referrerCounts[ref.slice(0, 60) || 'direct'] = (referrerCounts[ref.slice(0, 60) || 'direct'] || 0) + 1;
            }
            if (data.country) {
              rawCountryCounts[String(data.country)] = (rawCountryCounts[String(data.country)] || 0) + 1;
            }
          });
        } catch {
          // ignore fallback error
        }
      }

      // Format location counts with friendly names and national flags
      const formattedLocationCounts: Record<string, number> = {};
      for (const [code, count] of Object.entries(rawCountryCounts)) {
        const { label, flag } = formatCountryLabel(code);
        const displayKey = `${flag} ${label}`;
        formattedLocationCounts[displayKey] = (formattedLocationCounts[displayKey] || 0) + count;
      }

      const dailyStats = Object.entries(dailyMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, counts]) => ({
          date,
          views: counts.views,
          clicks: counts.clicks,
        }));

      const topLinks = Object.entries(linkClickCounts)
        .map(([linkId, clicks]) => ({
          linkId,
          clicks,
          title: linkDetails[linkId]?.title || 'Link Card',
          url: linkDetails[linkId]?.url,
          color: linkDetails[linkId]?.color,
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

      const rawCtr = totalViews > 0 ? (totalClicks / totalViews) * 100 : (totalClicks > 0 ? 100 : 0);

      return {
        totalViews,
        totalClicks,
        ctr: rawCtr.toFixed(1),
        overallCtr: Number(rawCtr.toFixed(1)),
        propertyViews,
        showingRequests,
        homeValuations,
        brandInquiries,
        mediaKitDownloads,
        packageClicks: 0,
        packageBookings,
        generalContacts,
        musicBookings,
        podcastSponsorships,
        estimatedPipelineValueINR: 0,
        deviceCounts,
        browserCounts,
        referrerCounts,
        locationCounts: formattedLocationCounts,
        linkClickCounts,
        topLinks,
        dailyStats,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `pages/${targetPageId}/stats`);
      return defaultSummary;
    }
  },

  async getSpecializedAnalyticsSummary(pageId: string): Promise<SpecializedAnalyticsSummary> {
    return this.getAnalyticsSummary(pageId, 30);
  },

  async getRecentEvents(pageId: string, limitCount = 50): Promise<any[]> {
    return [];
  },

  // Reset all past test metrics so author starts with 100% clean 0 visitor metrics
  async resetAnalytics(pageId: string): Promise<void> {
    const targetPageId = pageId || auth.currentUser?.uid;
    if (!targetPageId) return;

    try {
      // 1. Timestamp cutoff on page document
      const pageRef = doc(db, 'pages', targetPageId);
      await setDoc(pageRef, { analyticsResetAt: serverTimestamp() }, { merge: true });

      // 2. Reset clickCount to 0 on all cards in pages/{targetPageId}/links
      const linksRef = collection(db, 'pages', targetPageId, 'links');
      const snap = await getDocs(linksRef);
      const updates = snap.docs.map((d) =>
        setDoc(doc(db, 'pages', targetPageId, 'links', d.id), { clickCount: 0, clicks: 0 }, { merge: true })
      );
      await Promise.all(updates);
    } catch (err) {
      console.error('[analytics] resetAnalytics error:', err);
      throw err;
    }
  },
};
