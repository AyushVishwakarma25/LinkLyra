import {
  doc,
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
  async recordView(pageId: string): Promise<void> {
    if (!pageId) return;

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
  // and increment link counter on pages/{pageId}/links/{linkId}
  async recordClick(pageId: string, linkId: string): Promise<void> {
    if (!pageId || !linkId) return;

    if (typeof navigator !== 'undefined' && isBot(navigator.userAgent)) {
      return;
    }

    const isOwner = auth.currentUser && auth.currentUser.uid === pageId;
    if (isOwner) {
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
      // 1. Record event
      const eventRef = doc(db, 'pages', pageId, 'analytics', eventId);
      await setDoc(eventRef, sanitizeForFirestore(payload));

      // 2. Atomically increment link clickCount
      const linkRef = doc(db, 'pages', pageId, 'links', linkId);
      await setDoc(
        linkRef,
        {
          clickCount: increment(1),
          clicks: increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch {
      // Fire-and-forget
    }
  },

  // Query aggregated rollups from pages/{pageId}/stats/{yyyy-mm-dd}
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
      const statsRef = collection(db, 'pages', targetPageId, 'stats');
      const snap = await getDocs(query(statsRef, limit(days)));

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

      snap.forEach((d) => {
        const data = d.data();
        const dateKey = d.id;
        const views = Number(data.views || 0);
        const clicks = Number(data.clicks || 0);

        totalViews += views;
        totalClicks += clicks;
        dailyMap[dateKey] = { views, clicks };

        propertyViews += Number(data.propertyViews || 0);
        showingRequests += Number(data.showingRequests || 0);
        homeValuations += Number(data.homeValuations || 0);
        brandInquiries += Number(data.brandInquiries || 0);
        mediaKitDownloads += Number(data.mediaKitDownloads || 0);
        packageBookings += Number(data.packageBookings || 0);
        generalContacts += Number(data.generalContacts || 0);
        musicBookings += Number(data.musicBookings || 0);
        podcastSponsorships += Number(data.podcastSponsorships || 0);

        if (data.devices && typeof data.devices === 'object') {
          for (const [k, v] of Object.entries(data.devices)) {
            deviceCounts[k] = (deviceCounts[k] || 0) + Number(v || 0);
          }
        }
        if (data.browsers && typeof data.browsers === 'object') {
          for (const [k, v] of Object.entries(data.browsers)) {
            browserCounts[k] = (browserCounts[k] || 0) + Number(v || 0);
          }
        }
        if (data.referrers && typeof data.referrers === 'object') {
          for (const [k, v] of Object.entries(data.referrers)) {
            referrerCounts[k] = (referrerCounts[k] || 0) + Number(v || 0);
          }
        }
        if (data.linkClicks && typeof data.linkClicks === 'object') {
          for (const [lId, count] of Object.entries(data.linkClicks)) {
            linkClickCounts[lId] = (linkClickCounts[lId] || 0) + Number(count || 0);
          }
        }
      });

      const dailyStats = Object.entries(dailyMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, counts]) => ({
          date,
          views: counts.views,
          clicks: counts.clicks,
        }));

      const topLinks = Object.entries(linkClickCounts)
        .map(([linkId, clicks]) => ({ linkId, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

      const rawCtr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

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
      handleFirestoreError(err, OperationType.LIST, `pages/${targetPageId}/stats`);
      return defaultSummary;
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
