import { describe, it, expect, beforeEach, vi } from 'vitest';

class MemoryStorage {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value.toString();
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

const mockLocalStorage = new MemoryStorage();
const mockSessionStorage = new MemoryStorage();

// Set up browser globals for Node test environment
(globalThis as any).window = {
  innerWidth: 1200,
};
(globalThis as any).localStorage = mockLocalStorage;
(globalThis as any).sessionStorage = mockSessionStorage;

const mockNav = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  webdriver: false,
};

try {
  Object.defineProperty(globalThis, 'navigator', {
    value: mockNav,
    configurable: true,
    writable: true,
  });
} catch {
  // if already defined
}

import {
  parseUserAgent,
  isBot,
  getVisitorId,
  shouldRecordPageView,
} from '../src/lib/analytics';

describe('Analytics Engine Unit Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    mockNav.webdriver = false;
    vi.restoreAllMocks();
  });

  describe('1. User Agent (UA) Parsing', () => {
    it('accurately parses desktop Chrome', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const parsed = parseUserAgent(ua);
      expect(parsed.browser).toBe('Chrome');
      expect(parsed.os).toBe('Windows');
      expect(parsed.device).toBe('desktop');
      expect(parsed.isInApp).toBe(false);
    });

    it('accurately parses mobile Safari on iPhone', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';
      const parsed = parseUserAgent(ua);
      expect(parsed.browser).toBe('Safari');
      expect(parsed.os).toBe('iOS');
      expect(parsed.device).toBe('mobile');
      expect(parsed.isInApp).toBe(false);
    });

    it('accurately parses Edge browser', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
      const parsed = parseUserAgent(ua);
      expect(parsed.browser).toBe('Edge');
      expect(parsed.os).toBe('Windows');
      expect(parsed.isInApp).toBe(false);
    });

    it('accurately parses Firefox', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';
      const parsed = parseUserAgent(ua);
      expect(parsed.browser).toBe('Firefox');
      expect(parsed.os).toBe('Windows');
      expect(parsed.isInApp).toBe(false);
    });

    it('accurately parses Samsung Internet', () => {
      const ua =
        'Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36';
      const parsed = parseUserAgent(ua);
      expect(parsed.browser).toBe('Samsung Internet');
      expect(parsed.os).toBe('Android');
      expect(parsed.device).toBe('mobile');
      expect(parsed.isInApp).toBe(false);
    });

    it('detects Instagram in-app browser', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/20F66 Instagram 287.0.0.25.77';
      const parsed = parseUserAgent(ua);
      expect(parsed.browser).toBe('Instagram');
      expect(parsed.isInApp).toBe(true);
      expect(parsed.device).toBe('mobile');
    });

    it('detects TikTok in-app browser', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/20G75 musical_ly_30.5.0';
      const parsed = parseUserAgent(ua);
      expect(parsed.browser).toBe('TikTok');
      expect(parsed.isInApp).toBe(true);
    });

    it('detects iPad tablet device', () => {
      const ua =
        'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1';
      const parsed = parseUserAgent(ua);
      expect(parsed.device).toBe('tablet');
    });
  });

  describe('2. Bot and Crawler Detection', () => {
    it('detects search engine crawlers', () => {
      expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true);
      expect(isBot('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)')).toBe(true);
      expect(isBot('DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)')).toBe(true);
      expect(isBot('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')).toBe(true);
    });

    it('detects headless automation tools', () => {
      expect(isBot('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36')).toBe(true);
    });

    it('detects navigator.webdriver flag', () => {
      mockNav.webdriver = true;
      expect(isBot()).toBe(true);
    });

    it('passes regular user agents as non-bots', () => {
      mockNav.webdriver = false;
      const normalChrome =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      expect(isBot(normalChrome)).toBe(false);

      const normalSafari =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';
      expect(isBot(normalSafari)).toBe(false);
    });
  });

  describe('3. Visitor UUID Management', () => {
    it('generates a persistent visitor ID in localStorage', () => {
      const id1 = getVisitorId();
      expect(id1).toBeTruthy();
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(10);

      // Subsequent call should retrieve the exact same ID
      const id2 = getVisitorId();
      expect(id2).toBe(id1);
    });

    it('respects pre-existing visitor IDs in localStorage', () => {
      mockLocalStorage.setItem('linklyra_visitor_id', 'custom_visitor_uuid_12345');
      const retrieved = getVisitorId();
      expect(retrieved).toBe('custom_visitor_uuid_12345');
    });
  });

  describe('4. Page View Deduplication (30 min window)', () => {
    it('allows initial page view and dedupes repeated views within 30 minutes', () => {
      const pageId = 'page_test_123';

      // 1st view must be allowed
      const firstView = shouldRecordPageView(pageId);
      expect(firstView).toBe(true);

      // 2nd view immediately after must be blocked (deduped)
      const secondView = shouldRecordPageView(pageId);
      expect(secondView).toBe(false);
    });

    it('allows page views for different pages independently', () => {
      expect(shouldRecordPageView('page_A')).toBe(true);
      expect(shouldRecordPageView('page_B')).toBe(true);

      expect(shouldRecordPageView('page_A')).toBe(false);
      expect(shouldRecordPageView('page_B')).toBe(false);
    });

    it('allows page view after 30 minutes have elapsed', () => {
      const pageId = 'page_expiry_test';
      expect(shouldRecordPageView(pageId)).toBe(true);

      // Simulate 31 minutes later
      const thirtyOneMinutesAgo = Date.now() - (31 * 60 * 1000);
      mockSessionStorage.setItem(`linklyra_view_${pageId}`, thirtyOneMinutesAgo.toString());

      // Should be allowed again
      expect(shouldRecordPageView(pageId)).toBe(true);
    });
  });
});
