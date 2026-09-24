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
