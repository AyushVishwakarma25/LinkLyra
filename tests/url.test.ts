import { describe, it, expect } from 'vitest';
import {
  normalizeExternalUrl,
  isValidExternalUrl,
  createMailtoUrl,
  createTelUrl,
  createWhatsAppUrl,
  safeOpenUrl,
} from '../src/lib/url';
import { sanitizeUrl, isSafeExternalUrl } from '../src/lib/security';

describe('URL Safety & Normalization (url.ts)', () => {
  describe('Dangerous schemes blocked', () => {
    it('blocks javascript: schemes in various casings', () => {
      expect(normalizeExternalUrl('javascript:alert(1)')).toBeNull();
      expect(normalizeExternalUrl('JAVASCRIPT:alert(1)')).toBeNull();
      expect(normalizeExternalUrl('JavaScript:void(0)')).toBeNull();
    });

    it('blocks javascript: with whitespace/tab/newline tricks inside the scheme', () => {
      expect(normalizeExternalUrl('  javascript:alert(1)  ')).toBeNull();
      expect(normalizeExternalUrl('java\tscript:alert(1)')).toBeNull();
      expect(normalizeExternalUrl('java\nscript:alert(1)')).toBeNull();
      expect(normalizeExternalUrl('java\r\nscript:alert(1)')).toBeNull();
      expect(normalizeExternalUrl('j a v a s c r i p t :alert(1)')).toBeNull();
    });

    it('blocks data: schemes', () => {
      expect(normalizeExternalUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
      expect(normalizeExternalUrl('DATA:image/svg+xml;base64,...')).toBeNull();
      expect(normalizeExternalUrl('  data:text/plain;base64,...')).toBeNull();
      expect(normalizeExternalUrl('da\tta:text/html,test')).toBeNull();
    });

    it('blocks vbscript: schemes', () => {
      expect(normalizeExternalUrl('vbscript:msgbox(1)')).toBeNull();
      expect(normalizeExternalUrl('VBSCRIPT:msgbox(1)')).toBeNull();
      expect(normalizeExternalUrl('vb\tscript:msgbox(1)')).toBeNull();
    });

    it('blocks file: and blob: schemes', () => {
      expect(normalizeExternalUrl('file:///etc/passwd')).toBeNull();
      expect(normalizeExternalUrl('FILE:///C:/secret.txt')).toBeNull();
      expect(normalizeExternalUrl('blob:http://localhost/uuid')).toBeNull();
      expect(normalizeExternalUrl('about:blank')).toBeNull();
    });

    it('rejects protocol-relative //host URLs', () => {
      expect(normalizeExternalUrl('//evil.com')).toBeNull();
      expect(normalizeExternalUrl('//evil.com/path?query=1')).toBeNull();
      expect(normalizeExternalUrl('  //attacker.com  ')).toBeNull();
      expect(normalizeExternalUrl('/\t/evil.com')).toBeNull();
    });
  });

  describe('Allowed schemes and schemeless normalization', () => {
    it('prepends https:// to bare domains', () => {
      expect(normalizeExternalUrl('example.com')).toBe('https://example.com/');
      expect(normalizeExternalUrl('instagram.com/ayush')).toBe('https://instagram.com/ayush');
      expect(normalizeExternalUrl('sub.domain.co.uk/page?id=10')).toBe('https://sub.domain.co.uk/page?id=10');
    });

    it('preserves and normalizes valid http:// and https:// schemes', () => {
      expect(normalizeExternalUrl('https://example.com')).toBe('https://example.com/');
      expect(normalizeExternalUrl('http://example.com/test')).toBe('http://example.com/test');
    });

    it('handles uppercase schemes gracefully', () => {
      expect(normalizeExternalUrl('HTTPS://EXAMPLE.COM/PATH')).toBe('https://example.com/PATH');
      expect(normalizeExternalUrl('HTTP://TEST.ORG')).toBe('http://test.org/');
      expect(normalizeExternalUrl('MAILTO:INFO@EXAMPLE.COM')).toBe('mailto:INFO@EXAMPLE.COM');
      expect(normalizeExternalUrl('TEL:+1234567890')).toBe('tel:+1234567890');
    });

    it('allows valid mailto: schemes', () => {
      expect(normalizeExternalUrl('mailto:user@example.com')).toBe('mailto:user@example.com');
      expect(normalizeExternalUrl('mailto:support@domain.org?subject=Help')).toBe('mailto:support@domain.org?subject=Help');
      expect(normalizeExternalUrl('mailto:invalid-email')).toBeNull();
    });

    it('allows valid tel: schemes', () => {
      expect(normalizeExternalUrl('tel:+1234567890')).toBe('tel:+1234567890');
      expect(normalizeExternalUrl('tel:9876543210')).toBe('tel:9876543210');
      expect(normalizeExternalUrl('tel:1')).toBeNull();
    });

    it('handles leading and trailing whitespace/tabs gracefully', () => {
      expect(normalizeExternalUrl('   https://example.com/test   \t')).toBe('https://example.com/test');
      expect(normalizeExternalUrl('\t example.com \n')).toBe('https://example.com/');
    });
  });

  describe('Internationalized Domain Names (IDN)', () => {
    it('correctly handles unicode/IDN domains via Punycode WHATWG standard', () => {
      const result = normalizeExternalUrl('https://münchen.de');
      expect(result).not.toBeNull();
      expect(result).toContain('xn--mnchen-3ya.de');
    });

    it('handles schemeless IDN domain', () => {
      const result = normalizeExternalUrl('münchen.de/visit');
      expect(result).not.toBeNull();
      expect(result).toContain('xn--mnchen-3ya.de/visit');
    });
  });

  describe('Invalid or malformed inputs', () => {
    it('returns null for empty, null, or undefined inputs', () => {
      expect(normalizeExternalUrl('')).toBeNull();
      expect(normalizeExternalUrl('   ')).toBeNull();
      expect(normalizeExternalUrl(null)).toBeNull();
      expect(normalizeExternalUrl(undefined)).toBeNull();
    });

    it('returns null for invalid domain structures', () => {
      expect(normalizeExternalUrl('http://.com')).toBeNull();
      expect(normalizeExternalUrl('http://com.')).toBeNull();
    });
  });

  describe('Helper functions: mailto, tel, whatsapp, safeOpenUrl', () => {
    it('createMailtoUrl builds valid mailto links', () => {
      expect(createMailtoUrl('user@example.com')).toBe('mailto:user@example.com');
      expect(createMailtoUrl('user@example.com', 'Hello', 'World')).toBe(
        'mailto:user@example.com?subject=Hello&body=World'
      );
      expect(createMailtoUrl('invalid-email')).toBeNull();
      expect(createMailtoUrl('')).toBeNull();
    });

    it('createTelUrl builds clean tel links', () => {
      expect(createTelUrl('+1 (555) 123-4567')).toBe('tel:+15551234567');
      expect(createTelUrl('9876543210')).toBe('tel:9876543210');
      expect(createTelUrl('ab')).toBeNull();
    });

    it('createWhatsAppUrl creates valid wa.me URLs', () => {
      expect(createWhatsAppUrl('+91 98765 43210')).toBe('https://wa.me/919876543210');
      expect(createWhatsAppUrl('919876543210', 'Hi there')).toBe(
        'https://wa.me/919876543210?text=Hi%20there'
      );
      expect(createWhatsAppUrl('https://wa.me/919876543210')).toBe('https://wa.me/919876543210');
      expect(createWhatsAppUrl('123')).toBeNull();
    });

    it('isValidExternalUrl returns boolean accuracy', () => {
      expect(isValidExternalUrl('https://google.com')).toBe(true);
      expect(isValidExternalUrl('//evil.com')).toBe(false);
      expect(isValidExternalUrl('javascript:alert(1)')).toBe(false);
      expect(isValidExternalUrl('')).toBe(false);
    });

    it('safeOpenUrl returns false for invalid URLs without throwing', () => {
      expect(safeOpenUrl('')).toBe(false);
      expect(safeOpenUrl('//evil.com')).toBe(false);
      expect(safeOpenUrl('javascript:alert(1)')).toBe(false);
    });
  });

  describe('Consolidated security.ts compatibility', () => {
    it('sanitizeUrl returns # for dangerous URLs and preserves safe URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
      expect(sanitizeUrl('//evil.com')).toBe('#');
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl('#')).toBe('#');
      expect(sanitizeUrl('/relative-path')).toBe('/relative-path');
    });

    it('isSafeExternalUrl validates URLs safely', () => {
      expect(isSafeExternalUrl('https://example.com')).toBe(true);
      expect(isSafeExternalUrl('//evil.com')).toBe(false);
      expect(isSafeExternalUrl('javascript:void(0)')).toBe(false);
    });
  });
});
