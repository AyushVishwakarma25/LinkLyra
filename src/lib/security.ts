/**
 * Security utilities for LinkLyra
 * - URL sanitization against javascript: / data: / XSS attacks
 * - Input validation & sanitization
 * 
 * Consolidated with src/lib/url.ts to ensure consistent URL safety.
 */

import { normalizeExternalUrl, isValidExternalUrl } from './url';

/**
 * Sanitizes URLs to ensure they only use safe protocols:
 * http:, https:, mailto:, tel:, or relative paths (#, /)
 * Returns '#' if unsafe protocol is detected.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === '#') {
    return trimmed;
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  const normalized = normalizeExternalUrl(trimmed);
  return normalized ?? '#';
}

/**
 * Validates whether a given URL is safe to open in an external tab.
 */
export function isSafeExternalUrl(url?: string | null): boolean {
  return isValidExternalUrl(url);
}
