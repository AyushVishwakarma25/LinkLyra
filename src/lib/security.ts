/**
 * Security utilities for LinkLyra
 * - URL sanitization against javascript: / data: / XSS attacks
 * - Input validation & sanitization
 */

/**
 * Sanitizes URLs to ensure they only use safe protocols:
 * http:, https:, mailto:, tel:, or relative paths (#, /)
 * Returns '#' if unsafe protocol is detected.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === '#' || trimmed === 'https://' || trimmed === 'http://') {
    return trimmed;
  }

  // Block javascript:, data:, vbscript:, etc.
  const lower = trimmed.toLowerCase();
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  for (const proto of dangerousProtocols) {
    if (lower.startsWith(proto) || lower.replace(/\s+/g, '').startsWith(proto)) {
      console.warn('Blocked potentially dangerous URL protocol:', trimmed);
      return '#';
    }
  }

  // If missing protocol but looks like a web address (e.g. www.google.com or example.com)
  if (!/^https?:\/\//i.test(trimmed) && !/^mailto:/i.test(trimmed) && !/^tel:/i.test(trimmed) && !trimmed.startsWith('/') && !trimmed.startsWith('#')) {
    if (trimmed.includes('.')) {
      return `https://${trimmed}`;
    }
  }

  return trimmed;
}

/**
 * Validates whether a given URL is safe to open in an external tab.
 */
export function isSafeExternalUrl(url?: string | null): boolean {
  if (!url) return false;
  const sanitized = sanitizeUrl(url);
  return sanitized !== '#' && (sanitized.startsWith('https://') || sanitized.startsWith('http://') || sanitized.startsWith('mailto:') || sanitized.startsWith('tel:'));
}
