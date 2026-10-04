import { transliterate } from 'transliteration';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const RESERVED_USERNAMES = new Set<string>([
  'admin',
  'administrator',
  'api',
  'app',
  'login',
  'signin',
  'signup',
  'register',
  'studio',
  'dashboard',
  'pricing',
  'terms',
  'privacy',
  'settings',
  'billing',
  'explore',
  'landing',
  'help',
  'support',
  'assets',
  'static',
  'index',
  'index.html',
  'creator',
  'creators',
  'www',
  'root',
  'auth',
  'oauth',
  'profile',
  'profiles',
  'page',
  'pages',
  'user',
  'users',
  'linklyra',
  'zeperai',
  'domain',
  'domains',
  'about',
  'contact',
  'legal',
  'docs',
  'documentation',
  'blog',
  'status',
  'mail',
  'email',
  'null',
  'undefined',
  'true',
  'false',
]);

export const RESERVED = RESERVED_USERNAMES;

/**
 * Normalizes a raw string into a clean, safe username:
 * 1. Transliterates non-Latin characters (Cyrillic, Hindi, Chinese, etc.) to Latin.
 * 2. Normalizes Unicode accents and diacritics.
 * 3. Replaces non-alphanumeric characters with underscores.
 * 4. Collapses and trims underscores.
 * 5. Clamps to max 30 chars.
 * 6. If result is < 3 characters or empty, falls back to `user_<uid>`.
 */
export function normalizeUsername(raw: string, fallbackUid?: string): string {
  if (!raw || typeof raw !== 'string') {
    if (fallbackUid) {
      const cleanUid = fallbackUid.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6) || 'creator';
      return `user_${cleanUid}`;
    }
    return '';
  }

  // 1. Transliterate non-Latin scripts (e.g. Cyrillic "Александр" -> "Aleksandr", Hindi "राहुल" -> "rahul")
  let normalized = transliterate(raw);

  // 2. Normalize Unicode diacritics (e.g. "Hélène" -> "Helene") and lowercase
  normalized = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  // 3. Replace any non-alphanumeric character with underscore
  normalized = normalized.replace(/[^a-z0-9_]/g, '_');

  // 4. Collapse consecutive underscores and trim from start/end
  normalized = normalized.replace(/_+/g, '_').replace(/^_+|_+$/g, '');

  // 5. Enforce 30 character max length
  if (normalized.length > 30) {
    normalized = normalized.slice(0, 30).replace(/_+$/, '');
  }

  // 6. Handle edge case where name was too short or stripped clean
  if (normalized.length < 3) {
    if (fallbackUid) {
      const cleanUid = fallbackUid.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6) || 'creator';
      return `user_${cleanUid}`;
    }
    return normalized;
  }

  return normalized;
}

/**
 * Validates whether a username conforms to system constraints:
 * - Must match ^[a-z0-9_]{3,30}$
 * - Must not be a reserved system route
 */
export function validateUsername(username: string): { valid: boolean; reason?: string } {
  if (!username) {
    return { valid: false, reason: 'Username cannot be empty.' };
  }

  const clean = username.trim();

  if (clean.length < 3) {
    return { valid: false, reason: 'Username must be at least 3 characters long.' };
  }

  if (clean.length > 30) {
    return { valid: false, reason: 'Username cannot exceed 30 characters.' };
  }

  const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;
  if (!USERNAME_REGEX.test(clean)) {
    return {
      valid: false,
      reason: 'Username can only contain lowercase letters, numbers, and underscores.',
    };
  }

  if (RESERVED_USERNAMES.has(clean.toLowerCase())) {
    return {
      valid: false,
      reason: `@${clean} is a reserved system address and cannot be claimed.`,
    };
  }

  return { valid: true };
}

/**
 * Checks Firestore usernames/{username} for availability.
 * Never calls doc(db, 'usernames', '') by strictly validating input first.
 */
export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean; reason?: string }> {
  const validation = validateUsername(username);
  if (!validation.valid) {
    return { available: false, reason: validation.reason };
  }

  const clean = username.trim().toLowerCase();
  try {
    const snap = await getDoc(doc(db, 'usernames', clean));
    if (snap.exists()) {
      return { available: false, reason: `Username @${clean} is already taken.` };
    }
    return { available: true };
  } catch (err: unknown) {
    console.warn(`Username availability check error for @${clean}:`, err);
    return { available: false, reason: 'Unable to verify username availability. Please try again.' };
  }
}

/**
 * Suggests an available username by testing candidate and appending numeric suffixes if taken or reserved.
 */
export async function suggestAvailableUsername(
  base: string,
  checkAvailabilityFn: (candidate: string) => Promise<boolean>,
  fallbackUid?: string
): Promise<string> {
  let cleanBase = normalizeUsername(base, fallbackUid);
  if (cleanBase.length < 3) {
    cleanBase = `user_${(fallbackUid || 'creator').toLowerCase().slice(0, 6)}`;
  }

  // If candidate is valid, not reserved, and available, return directly
  const initialValidation = validateUsername(cleanBase);
  if (initialValidation.valid) {
    const isAvail = await checkAvailabilityFn(cleanBase);
    if (isAvail) return cleanBase;
  }

  // Iterate with numeric suffixes
  for (let i = 1; i <= 99; i++) {
    const suffix = `_${i}`;
    const maxBaseLen = 30 - suffix.length;
    const truncatedBase = cleanBase.slice(0, maxBaseLen).replace(/_+$/, '');
    const candidate = `${truncatedBase}${suffix}`;

    const validation = validateUsername(candidate);
    if (validation.valid) {
      const isAvail = await checkAvailabilityFn(candidate);
      if (isAvail) {
        return candidate;
      }
    }
  }

  // Fallback with random hex
  const randomSuffix = `_${Math.random().toString(36).substring(2, 6)}`;
  return `${cleanBase.slice(0, 30 - randomSuffix.length)}${randomSuffix}`;
}

export interface SlugResolution {
  originalSlug: string;
  canonicalSlug: string;
  pageId: string | null;
  userId: string | null;
  status: 'active' | 'redirect' | 'reserved' | 'not_found';
  isRedirect: boolean;
  redirectTo?: string | null;
}

const slugCache = new Map<string, { data: SlugResolution; timestamp: number }>();
const SLUG_CACHE_TTL_MS = 60_000; // 60 seconds

export function clearSlugCache(): void {
  slugCache.clear();
}

/**
 * Resolves a profile slug with support for 301/302 aliases, redirect chains (max 3 hops),
 * and in-memory TTL caching.
 */
export async function resolveProfileSlug(rawSlug: string): Promise<SlugResolution> {
  const clean = (rawSlug || '').toLowerCase().trim().replace(/^@/, '');
  if (!clean) {
    return {
      originalSlug: '',
      canonicalSlug: '',
      pageId: null,
      userId: null,
      status: 'not_found',
      isRedirect: false,
    };
  }

  // Reserved slug check
  if (RESERVED_USERNAMES.has(clean)) {
    return {
      originalSlug: clean,
      canonicalSlug: clean,
      pageId: null,
      userId: null,
      status: 'reserved',
      isRedirect: false,
    };
  }

  // Check in-memory cache
  const cached = slugCache.get(clean);
  if (cached && Date.now() - cached.timestamp < SLUG_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    let currentSlug = clean;
    let hops = 0;
    let isRedirect = false;

    while (hops < 3) {
      const snap = await getDoc(doc(db, 'usernames', currentSlug));
      if (snap.exists()) {
        const data = snap.data();
        if (data?.status === 'redirect' && data.redirectToSlug) {
          isRedirect = true;
          currentSlug = data.redirectToSlug.toLowerCase().trim().replace(/^@/, '');
          hops++;
          continue;
        }

        const res: SlugResolution = {
          originalSlug: clean,
          canonicalSlug: currentSlug,
          pageId: data?.pageId || data?.userId || data?.uid || null,
          userId: data?.userId || data?.uid || null,
          status: isRedirect ? 'redirect' : (data?.status || 'active'),
          isRedirect,
          redirectTo: isRedirect ? currentSlug : null,
        };
        slugCache.set(clean, { data: res, timestamp: Date.now() });
        return res;
      }
      break;
    }

    // Direct pages collection lookup fallback
    const q = query(collection(db, 'pages'), where('username', '==', clean), limit(1));
    const pageSnap = await getDocs(q);
    if (!pageSnap.empty) {
      const pageDoc = pageSnap.docs[0];
      const pageData = pageDoc.data();
      const res: SlugResolution = {
        originalSlug: clean,
        canonicalSlug: clean,
        pageId: pageDoc.id,
        userId: pageData.userId || pageDoc.id,
        status: 'active',
        isRedirect: false,
      };
      slugCache.set(clean, { data: res, timestamp: Date.now() });
      return res;
    }

    const notFoundRes: SlugResolution = {
      originalSlug: clean,
      canonicalSlug: clean,
      pageId: null,
      userId: null,
      status: 'not_found',
      isRedirect: false,
    };
    slugCache.set(clean, { data: notFoundRes, timestamp: Date.now() });
    return notFoundRes;
  } catch (err) {
    console.warn(`[resolveProfileSlug] Error resolving slug @${clean}:`, err);
    return {
      originalSlug: clean,
      canonicalSlug: clean,
      pageId: null,
      userId: null,
      status: 'not_found',
      isRedirect: false,
    };
  }
}
