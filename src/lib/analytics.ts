/**
 * Client-side Analytics Utilities
 * 
 * Includes:
 * 1. User Agent (UA) parsing for desktop, mobile, tablet & in-app browsers
 * 2. Bot & crawler detection
 * 3. Visitor UUID generation and persistence
 * 4. Page view deduplication (30-minute window via sessionStorage)
 */

export interface ParsedUserAgent {
  browser: string;
  device: 'mobile' | 'tablet' | 'desktop';
  os: string;
  isInApp: boolean;
}

/**
 * Parses user agent string to identify browser, device, OS, and in-app webviews.
 */
export function parseUserAgent(uaString?: string): ParsedUserAgent {
  const ua = uaString || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '';
  const lower = ua.toLowerCase();

  // 1. In-App Browsers (Checked first because they often include Safari or Chrome tokens)
  let browser = 'Other';
  let isInApp = false;

  if (lower.includes('instagram')) {
    browser = 'Instagram';
    isInApp = true;
  } else if (lower.includes('tiktok') || lower.includes('musical_ly')) {
    browser = 'TikTok';
    isInApp = true;
  } else if (lower.includes('fbav') || lower.includes('fban') || lower.includes('facebook') || lower.includes('fbios') || lower.includes('fb_iab')) {
    browser = 'Facebook';
    isInApp = true;
  } else if (lower.includes('twitter') || lower.includes('x-app')) {
    browser = 'Twitter/X';
    isInApp = true;
  } else if (lower.includes('linkedin')) {
    browser = 'LinkedIn';
    isInApp = true;
  } else if (lower.includes('whatsapp')) {
    browser = 'WhatsApp';
    isInApp = true;
  } else if (lower.includes('snapchat')) {
    browser = 'Snapchat';
    isInApp = true;
  } else if (lower.includes('edg/') || lower.includes('edge/')) {
    browser = 'Edge';
  } else if (lower.includes('samsungbrowser')) {
    browser = 'Samsung Internet';
  } else if (lower.includes('firefox') || lower.includes('fxios')) {
    browser = 'Firefox';
  } else if (lower.includes('chrome') || lower.includes('crios')) {
    browser = 'Chrome';
  } else if (lower.includes('safari') && !lower.includes('chrome')) {
    browser = 'Safari';
  }

  // 2. Device Classification
  let device: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
  const isMobile = /(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo)/i.test(ua);

  if (isTablet) {
    device = 'tablet';
  } else if (isMobile) {
    device = 'mobile';
  } else if (typeof window !== 'undefined') {
    if (window.innerWidth < 640) {
      device = 'mobile';
    } else if (window.innerWidth < 1024) {
      device = 'tablet';
    } else {
      device = 'desktop';
    }
  }

  // 3. Operating System
  let os = 'Other';
  if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  return { browser, device, os, isInApp };
}

/**
 * Checks if the current visitor is an automated bot, web crawler, or automated test runner.
 */
export function isBot(uaString?: string): boolean {
  // Check webdriver flag
  if (typeof navigator !== 'undefined' && (navigator as Navigator & { webdriver?: boolean }).webdriver) {
    return true;
  }

  const ua = uaString || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '';
  const botRegex = /bot|crawler|spider|crawling|googlebot|bingbot|yahoo|duckduckbot|baiduspider|yandexbot|facebookexternalhit|whatsapp|telegrambot|twitterbot|slackbot|discordbot|headlesschrome|phantomjs|puppeteer/i;
  
  return botRegex.test(ua);
}

const VISITOR_ID_KEY = 'linklyra_visitor_id';

/**
 * Retrieves or creates a persistent anonymous UUID for the visitor in localStorage.
 */
export function getVisitorId(): string {
  if (typeof window === 'undefined') {
    return 'anonymous-server';
  }

  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing && existing.length > 10) {
      return existing;
    }

    // Generate random UUID
    let newId: string;
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      newId = crypto.randomUUID();
    } else {
      newId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
    }

    localStorage.setItem(VISITOR_ID_KEY, newId);
    return newId;
  } catch {
    // If localStorage is blocked (e.g. strict private browsing)
    return 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
  }
}

const VIEW_DEDUPE_PREFIX = 'linklyra_view_';
const VIEW_WINDOW_MS = 10 * 1000; // 10 seconds (prevents rapid double-click flooding while capturing separate visits)

/**
 * Deduplicates page views within a 30-minute window per page per visitor using sessionStorage.
 * Returns true if this view should be recorded, or false if it was already recorded in the last 30 minutes.
 */
export function shouldRecordPageView(pageId: string): boolean {
  if (typeof window === 'undefined' || !pageId) {
    return false;
  }

  try {
    const key = `${VIEW_DEDUPE_PREFIX}${pageId}`;
    const lastViewStr = sessionStorage.getItem(key);
    const now = Date.now();

    if (lastViewStr) {
      const lastView = parseInt(lastViewStr, 10);
      if (!isNaN(lastView) && now - lastView < VIEW_WINDOW_MS) {
        return false; // Viewed recently, skip
      }
    }

    sessionStorage.setItem(key, now.toString());
    return true;
  } catch {
    return true;
  }
}

// -------------------------------------------------------------
// High-Throughput Analytics Stream Buffer (Alternate Architecture)
// -------------------------------------------------------------

export interface TelemetryEvent {
  type: string;
  pageId: string;
  linkId?: string | null;
  visitorId: string;
  device: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os?: string;
  referrer?: string;
  country?: string;
  timestamp: number;
}

export const COUNTRY_NAMES: Record<string, { name: string; flag: string }> = {
  IN: { name: 'India', flag: '🇮🇳' },
  US: { name: 'United States', flag: '🇺🇸' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' },
  AE: { name: 'UAE (Dubai)', flag: '🇦🇪' },
  CA: { name: 'Canada', flag: '🇨🇦' },
  AU: { name: 'Australia', flag: '🇦🇺' },
  DE: { name: 'Germany', flag: '🇩🇪' },
  FR: { name: 'France', flag: '🇫🇷' },
  SG: { name: 'Singapore', flag: '🇸🇬' },
  JP: { name: 'Japan', flag: '🇯🇵' },
  NL: { name: 'Netherlands', flag: '🇳🇱' },
  BR: { name: 'Brazil', flag: '🇧🇷' },
  GLOBAL: { name: 'Global Direct', flag: '🌍' },
};

export function formatCountryLabel(countryCode: string): { label: string; flag: string } {
  const code = (countryCode || '').toUpperCase().trim();
  if (COUNTRY_NAMES[code]) {
    return { label: COUNTRY_NAMES[code].name, flag: COUNTRY_NAMES[code].flag };
  }
  return { label: code.length === 2 ? `Country (${code})` : (code || 'Global'), flag: '🌍' };
}

const OFFLINE_QUEUE_KEY = 'linklyra_analytics_offline_queue';
const CLICK_DEBOUNCE_WINDOW_MS = 800;
const lastClickTimestamps = new Map<string, number>();

class AnalyticsStreamEngine {
  private queue: TelemetryEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private isFlushing = false;
  private customDispatcher: ((events: TelemetryEvent[]) => Promise<void>) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.restorePendingQueue();

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush(true);
        }
      });

      window.addEventListener('pagehide', () => {
        this.flush(true);
      });

      window.addEventListener('online', () => {
        this.restorePendingQueue();
        this.flush(false);
      });
    }
  }

  public setDispatcher(dispatcher: (events: TelemetryEvent[]) => Promise<void>) {
    this.customDispatcher = dispatcher;
  }

  public enqueue(event: TelemetryEvent): void {
    if (event.type === 'link_click' && event.linkId) {
      const clickKey = `${event.pageId}::${event.linkId}`;
      const last = lastClickTimestamps.get(clickKey) || 0;
      const now = Date.now();
      if (now - last < CLICK_DEBOUNCE_WINDOW_MS) {
        return;
      }
      lastClickTimestamps.set(clickKey, now);
    }

    this.queue.push(event);
    this.persistQueue();

    if (this.queue.length >= 5) {
      this.flush(false);
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.flush(false);
      }, 1500);
    }
  }

  public async flush(_isUnloading = false): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0 || this.isFlushing) {
      return;
    }

    const batch = [...this.queue];
    this.queue = [];
    this.persistQueue();

    if (this.customDispatcher) {
      this.isFlushing = true;
      try {
        await this.customDispatcher(batch);
      } catch (err) {
        console.warn('[AnalyticsStream] Dispatch notice (re-queuing for retry):', err);
        this.queue.unshift(...batch);
        this.persistQueue();
      } finally {
        this.isFlushing = false;
      }
    }
  }

  private persistQueue(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      if (this.queue.length === 0) {
        localStorage.removeItem(OFFLINE_QUEUE_KEY);
      } else {
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue.slice(-50)));
      }
    } catch {}
  }

  private restorePendingQueue(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.queue.push(...parsed);
          localStorage.removeItem(OFFLINE_QUEUE_KEY);
        }
      }
    } catch {}
  }
}

export const analyticsStreamEngine = new AnalyticsStreamEngine();
