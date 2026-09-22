/**
 * LinkLyra URL Safety & Normalization Engine
 * 
 * Provides strict validation and normalization for user-supplied external links.
 * Blocks dangerous schemes (javascript:, data:, vbscript:, file:, blob:, about:).
 * Rejects protocol-relative //host URLs.
 * Allows only http, https, mailto, and tel schemes (case-insensitive).
 * Automatically prepends https:// to schemeless URLs (e.g. 'instagram.com/user').
 * Validates internationalized domain names (IDN) via WHATWG URL.
 */

const DANGEROUS_SCHEMES = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'blob:',
  'about:',
];

const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * Normalizes and validates an external URL.
 * 
 * - Trims whitespace, tabs, newlines, and non-printable control characters.
 * - Rejects protocol-relative URLs (e.g. '//evil.com').
 * - Rejects dangerous schemes (javascript:, data:, vbscript:, file:, etc.)
 *   even if obfuscated with whitespace/tab/newline characters inside the scheme.
 * - Allows only http, https, mailto, and tel schemes.
 * - Prepends 'https://' to valid schemeless domains.
 * - Returns normalized URL string or null if invalid or unsafe.
 */
export function normalizeExternalUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;

  // 1. Strip non-printable control bytes and trim
  let cleaned = rawUrl.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
  if (!cleaned) return null;

  // 2. Reject protocol-relative URLs (//evil.com)
  if (cleaned.startsWith('//')) {
    return null;
  }

  // 3. Check for dangerous schemes even if obfuscated by whitespace or tabs (e.g., "java\tscript:")
  const strippedOfSpace = cleaned.replace(/[\s\t\r\n]+/g, '').toLowerCase();
  for (const scheme of DANGEROUS_SCHEMES) {
    if (strippedOfSpace.startsWith(scheme)) {
      return null;
    }
  }

  // Check if strippedOfSpace starts with //
  if (strippedOfSpace.startsWith('//')) {
    return null;
  }

  // 4. Handle mailto: and tel: explicitly
  if (strippedOfSpace.startsWith('mailto:')) {
    const rawMailto = cleaned.replace(/^[\s\t\r\n]*mailto:[\s\t\r\n]*/i, '');
    if (!rawMailto || !rawMailto.includes('@')) return null;
    try {
      const parsed = new URL(`mailto:${rawMailto}`);
      return parsed.toString();
    } catch {
      return null;
    }
  }

  if (strippedOfSpace.startsWith('tel:')) {
    const rawTel = cleaned.replace(/^[\s\t\r\n]*tel:[\s\t\r\n]*/i, '');
    const cleanDigits = rawTel.replace(/[^\d+]/g, '');
    if (!cleanDigits || cleanDigits.length < 3) return null;
    return `tel:${cleanDigits}`;
  }

  // 5. If no scheme is present, prepend https://
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(cleaned)) {
    // Must look somewhat like a valid host or path (must not be empty)
    cleaned = `https://${cleaned}`;
  }

  // 6. Parse using WHATWG URL parser
  try {
    const parsed = new URL(cleaned);

    // Strictly enforce allowed schemes
    if (!ALLOWED_SCHEMES.includes(parsed.protocol.toLowerCase())) {
      return null;
    }

    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      // Must have a valid non-empty hostname
      if (!parsed.hostname || parsed.hostname.trim() === '') {
        return null;
      }

      // Disallow single-character non-letter hostnames or invalid dots
      if (parsed.hostname.startsWith('.') || parsed.hostname.endsWith('.')) {
        return null;
      }
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Checks whether an external URL is valid and safe to navigate to.
 */
export function isValidExternalUrl(rawUrl: string | null | undefined): boolean {
  return normalizeExternalUrl(rawUrl) !== null;
}

/**
 * Creates and normalizes a mailto: URL.
 */
export function createMailtoUrl(email: string | null | undefined, subject?: string, body?: string): string | null {
  if (!email) return null;
  const cleanEmail = email.trim().replace(/^mailto:/i, '');
  if (!cleanEmail || !cleanEmail.includes('@')) return null;

  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);

  const query = params.toString();
  return `mailto:${cleanEmail}${query ? `?${query}` : ''}`;
}

/**
 * Creates and normalizes a tel: URL.
 */
export function createTelUrl(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleanPhone = phone.trim().replace(/^tel:/i, '');
  // Keep numbers and leading +
  const sanitized = cleanPhone.replace(/[^\d+]/g, '');
  if (!sanitized || sanitized.length < 3) return null;
  return `tel:${sanitized}`;
}

/**
 * Creates a normalized WhatsApp direct click URL.
 */
export function createWhatsAppUrl(phoneOrUrl: string | null | undefined, text?: string): string | null {
  if (!phoneOrUrl) return null;
  const raw = phoneOrUrl.trim();
  if (!raw) return null;

  // If already a valid https://wa.me link, return as is (with optional text)
  if (raw.startsWith('https://wa.me/') || raw.startsWith('http://wa.me/')) {
    const url = normalizeExternalUrl(raw);
    if (!url) return null;
    if (text) {
      try {
        const parsed = new URL(url);
        parsed.searchParams.set('text', text);
        return parsed.toString();
      } catch {
        return url;
      }
    }
    return url;
  }

  // Extract digits
  const digits = raw.replace(/\D/g, '');
  if (!digits || digits.length < 5) return null;

  const encodedText = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${digits}${encodedText}`;
}

/**
 * Safely opens an external URL in a new window with security flags.
 */
export function safeOpenUrl(rawUrl: string | null | undefined, target = '_blank'): boolean {
  if (!rawUrl) return false;

  const normalized = normalizeExternalUrl(rawUrl);
  if (!normalized) {
    console.warn('[URL Safety] Blocked unsafe or invalid URL:', rawUrl);
    return false;
  }

  if (typeof window !== 'undefined') {
    // Handle mailto: and tel: directly via window.location.href
    if (normalized.startsWith('mailto:') || normalized.startsWith('tel:')) {
      window.location.href = normalized;
      return true;
    }

    window.open(normalized, target, 'noopener,noreferrer');
    return true;
  }
  return false;
}
