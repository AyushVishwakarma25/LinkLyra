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
} from 'firebase/firestore';
import {
  auth,
  db,
  sanitizeForFirestore,
  handleFirestoreError,
  OperationType,
  FirestoreAnalyticsEvent,
} from './app';
import {
  parseUserAgent,
  getVisitorId,
  isBot,
  shouldRecordPageView,
} from '../analytics';
import { SpecializedAnalyticsSummary } from '../../types';

export const analyticsService = {
  // Record page view event in canonical subcollection: pages/{pageId}/analytics
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

    const eventId = `ev_view_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const visitorId = getVisitorId();
    const uaInfo = typeof navigator !== 'undefined' ? parseUserAgent(navigator.userAgent) : { device: 'desktop' as const, browser: 'unknown' };
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    const payload: FirestoreAnalyticsEvent = {
      type: 'page_view',
      linkId: null,
      visitorId,
      country: 'Global',
      device: uaInfo.device,
      browser: uaInfo.browser,
      referrer,
      timestamp: serverTimestamp(),
    };

    try {
      const eventRef = doc(db, 'pages', pageId, 'analytics', eventId);
      await setDoc(eventRef, sanitizeForFirestore(payload));
    } catch {
      // Fire-and-forget metric recording: suppress user-facing errors
    }
  },

  // Record link click event in canonical subcollection: pages/{pageId}/analytics
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

    const eventId = `ev_click_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const visitorId = getVisitorId();
    const uaInfo = typeof navigator !== 'undefined' ? parseUserAgent(navigator.userAgent) : { device: 'desktop' as const, browser: 'unknown' };
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    const payload: FirestoreAnalyticsEvent = {
      type: 'link_click',
      linkId,
      visitorId,
      country: 'Global',
      device: uaInfo.device,
      browser: uaInfo.browser,
      referrer,
      timestamp: serverTimestamp(),
    };

    try {
      // 1. Record event in analytics subcollection
      const eventRef = doc(db, 'pages', pageId, 'analytics', eventId);
      await setDoc(eventRef, sanitizeForFirestore(payload));

      // 2. Atomically increment link clickCount for verified visitor interactions
      const linkRef = doc(db, 'pages', pageId, 'links', linkId);
      await setDoc(
        linkRef,
        {
          clickCount: increment(1),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[analytics] recordClick notice:', err);
    }
  },

  // Query aggregated rollups from pages/{pageId}/stats/{yyyy-mm-dd}
  // with fallback to direct aggregation from pages/{pageId}/analytics
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
      linkClickCounts: {},
      topLinks: [],
      dailyStats: [],
    };

    if (!targetPageId) return defaultSummary;

    try {
      // 1. Check if the page has an analyticsResetAt timestamp cutoff
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
      const linkClickCounts: Record<string, number> = {};
      const dailyMap: Record<string, { views: number; clicks: number }> = {};

      // 2. Query verified raw visitor analytics events from pages/{targetPageId}/analytics
      // This is the SINGLE SOURCE OF TRUTH for genuine external audience interactions.
      try {
        const analyticsRef = collection(db, 'pages', targetPageId, 'analytics');
        const rawSnap = await getDocs(query(analyticsRef, limit(1000)));

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

          // Strictly filter out any interactions prior to the date range or reset timestamp
          if (effectiveCutoffMs > 0 && eventTs < effectiveCutoffMs) {
            return;
          }

          if (!dailyMap[dateKey]) {
            dailyMap[dateKey] = { views: 0, clicks: 0 };
          }

          if (eventType === 'page_view') {
            totalViews += 1;
            dailyMap[dateKey].views += 1;
          } else if (eventType === 'link_click') {
            totalClicks += 1;
            dailyMap[dateKey].clicks += 1;
            if (data.linkId && typeof data.linkId === 'string') {
              const cleanLinkId = data.linkId;
              linkClickCounts[cleanLinkId] = (linkClickCounts[cleanLinkId] || 0) + 1;
            }
          } else if (eventType === 'property_view') {
            propertyViews += 1;
          } else if (eventType === 'showing_request') {
            showingRequests += 1;
          } else if (eventType === 'home_valuation') {
            homeValuations += 1;
          } else if (eventType === 'brand_inquiry') {
            brandInquiries += 1;
          } else if (eventType === 'media_kit_download') {
            mediaKitDownloads += 1;
          } else if (eventType === 'package_booking') {
            packageBookings += 1;
          } else if (eventType === 'general_contact') {
            generalContacts += 1;
          } else if (eventType === 'music_booking') {
            musicBookings += 1;
          } else if (eventType === 'podcast_sponsorship') {
            podcastSponsorships += 1;
          }

          // Device breakdown
          if (data.device && typeof data.device === 'string') {
            const dev = data.device.toLowerCase();
            if (dev === 'mobile' || dev === 'desktop' || dev === 'tablet') {
              deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
            }
          }
          // Browser breakdown
          if (data.browser && typeof data.browser === 'string') {
            browserCounts[data.browser] = (browserCounts[data.browser] || 0) + 1;
          }
          // Referrer breakdown
          if (data.referrer && typeof data.referrer === 'string') {
            let ref = data.referrer;
            try {
              if (ref.startsWith('http')) {
                ref = new URL(ref).hostname.replace(/^www\./, '');
              }
            } catch {}
            const cleanRef = ref.slice(0, 60) || 'direct';
            referrerCounts[cleanRef] = (referrerCounts[cleanRef] || 0) + 1;
          }
        });
      } catch (rawErr) {
        console.warn('[analytics] Direct raw analytics notice:', rawErr);
      }

      // 3. Fetch card metadata (titles, urls, colors) strictly for display labels.
      // We NEVER inject unverified link clickCount fields into visitor analytics.
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
        linkClickCounts,
        topLinks,
        dailyStats,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `pages/${targetPageId}/analytics`);
      return defaultSummary;
    }
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

  async getSpecializedAnalyticsSummary(pageId: string): Promise<SpecializedAnalyticsSummary> {
    return this.getAnalyticsSummary(pageId, 30);
  },

  async getRecentEvents(pageId: string, maxEvents = 50): Promise<FirestoreAnalyticsEvent[]> {
    const targetPageId = pageId || auth.currentUser?.uid;
    if (!targetPageId) return [];

    try {
      const ref = collection(db, 'pages', targetPageId, 'analytics');
      const snap = await getDocs(query(ref, limit(maxEvents)));

      const events: FirestoreAnalyticsEvent[] = [];
      snap.forEach((d) => {
        events.push(d.data() as FirestoreAnalyticsEvent);
      });
      return events;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `pages/${targetPageId}/analytics`);
      return [];
    }
  },
};
