import { describe, it, expect } from 'vitest';
import { resolveRoute, getRouteTarget, isPlatformHost } from '../src/lib/routing';

describe('Unified Routing Engine (routing.ts)', () => {
  describe('isPlatformHost', () => {
    it('recognizes default platform hosts and wildcards', () => {
      expect(isPlatformHost('localhost')).toBe(true);
      expect(isPlatformHost('127.0.0.1')).toBe(true);
      expect(isPlatformHost('linklyra.web.app')).toBe(true);
      expect(isPlatformHost('zeperai.web.app')).toBe(true);
      expect(isPlatformHost('myproject.firebaseapp.com')).toBe(true);
      expect(isPlatformHost('ais-dev.asia-southeast1.run.app')).toBe(true);
      expect(isPlatformHost('project.ai.studio')).toBe(true);
    });

    it('identifies custom domains as non-platform hosts', () => {
      expect(isPlatformHost('creator.com')).toBe(false);
      expect(isPlatformHost('bio.johndoe.me')).toBe(false);
      expect(isPlatformHost('links.ayush.in')).toBe(false);
    });

    it('respects custom platform hosts parameter', () => {
      expect(isPlatformHost('customplatform.org', ['customplatform.org'])).toBe(true);
    });
  });

  describe('resolveRoute specifications', () => {
    // 1. Localhost
    it('handles localhost correctly for landing and profiles', () => {
      expect(resolveRoute('localhost', '/', '')).toBe('landing');
      expect(resolveRoute('localhost', '', '')).toBe('landing');
      expect(resolveRoute('localhost', '/index.html', '')).toBe('landing');
      expect(resolveRoute('localhost', '/johndoe', '')).toBe('profile');
      expect(getRouteTarget('localhost', '/johndoe', '')).toBe('johndoe');
    });

    // 2. *.web.app preview URL
    it('handles a *.web.app preview URL as a platform host', () => {
      expect(resolveRoute('linklyra-preview-pr12.web.app', '/', '')).toBe('landing');
      expect(resolveRoute('my-preview-app.web.app', '/creator123', '')).toBe('profile');
      expect(getRouteTarget('my-preview-app.web.app', '/creator123', '')).toBe('creator123');
    });

    // 3. The production host with a valid username
    it('resolves production host with a valid username to "profile"', () => {
      // Assuming canonical production host or custom host
      expect(resolveRoute('linklyra.com', '/ayush', '')).toBe('profile');
      expect(getRouteTarget('linklyra.com', '/ayush', '')).toBe('ayush');
      expect(resolveRoute('localhost', '/sarah_connor', '')).toBe('profile');
    });

    // 4. The production host with a reserved path
    it('resolves production host with a reserved path to "404" (or "studio")', () => {
      expect(resolveRoute('linklyra.com', '/admin', '')).toBe('404');
      expect(resolveRoute('linklyra.com', '/pricing', '')).toBe('404');
      expect(resolveRoute('linklyra.com', '/login', '')).toBe('404');
      expect(resolveRoute('linklyra.com', '/billing', '')).toBe('404');
      expect(resolveRoute('linklyra.com', '/studio', '')).toBe('studio');
    });

    // 5. An unrecognized custom domain
    it('resolves unrecognized custom domains to "domain"', () => {
      expect(resolveRoute('bio.mybrand.xyz', '/', '')).toBe('domain');
      expect(resolveRoute('sarahmusic.co', '/anything', '')).toBe('domain');
      expect(getRouteTarget('sarahmusic.co', '/', '')).toBe('sarahmusic.co');
    });

    // 6. ?view=studio overriding the default route on a profile URL
    it('overrides profile URL with ?view=studio to return "studio"', () => {
      expect(resolveRoute('linklyra.com', '/ayush', '?view=studio')).toBe('studio');
      expect(resolveRoute('localhost', '/johndoe', '?view=studio')).toBe('studio');
      expect(resolveRoute('preview.web.app', '/sarah', '?edit=true')).toBe('studio');
      expect(resolveRoute('localhost', '/ayush', '#studio')).toBe('studio');
    });

    // Options object format compatibility
    it('supports options object signature for backwards compatibility', () => {
      expect(resolveRoute({ hostname: 'localhost', pathname: '/ayush' })).toBe('profile');
      expect(resolveRoute({ hostname: 'ayush.com' })).toBe('domain');
      expect(resolveRoute({ hostname: 'linklyra.web.app', search: '?view=studio' })).toBe('studio');
    });

    // Hash & search parameter fallbacks
    it('resolves query parameters ?user= and ?domain=', () => {
      expect(resolveRoute('linklyra.web.app', '/', '?u=sarah')).toBe('profile');
      expect(getRouteTarget('linklyra.web.app', '/', '?u=sarah')).toBe('sarah');
      expect(resolveRoute('linklyra.web.app', '/', '?domain=bio.sarah.com')).toBe('domain');
      expect(getRouteTarget('linklyra.web.app', '/', '?domain=bio.sarah.com')).toBe('bio.sarah.com');
    });
  });
});
