import { RESERVED } from './username';

export type RouteType = 'landing' | 'studio' | 'profile' | 'domain' | '404';

export interface RouteOptions {
  hostname?: string;
  pathname?: string;
  path?: string;
  search?: string;
  hash?: string;
}

const DEFAULT_APP_HOST = 'linklyra.com';

const DEFAULT_PLATFORM_PATTERNS = [
  'localhost',
  '127.0.0.1',
  '*.run.app',
  '*.web.app',
  '*.firebaseapp.com',
  '*.ai.studio',
];

/**
 * Determines whether a given hostname is a LinkLyra platform host.
 * Non-platform hosts are treated as candidate custom domains.
 */
export function isPlatformHost(
  hostname: string,
  customPlatformHosts?: string[],
  appHost?: string
): boolean {
  const host = (hostname || '').toLowerCase().trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') return true;

  let envList: string[] = [];
  let configuredAppHost: string = (appHost || '').toLowerCase().trim();

  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.VITE_PLATFORM_HOSTS) {
        envList = import.meta.env.VITE_PLATFORM_HOSTS.split(',')
          .map((s: string) => s.trim().toLowerCase())
          .filter(Boolean);
      }
      if (!configuredAppHost && import.meta.env.VITE_APP_HOST) {
        configuredAppHost = import.meta.env.VITE_APP_HOST.trim().toLowerCase();
      }
    }
  } catch {
    // Ignore environments where import.meta.env is inaccessible
  }

  if (!configuredAppHost) {
    try {
      if (typeof process !== 'undefined' && process.env?.VITE_APP_HOST) {
        configuredAppHost = process.env.VITE_APP_HOST.trim().toLowerCase();
      }
    } catch {
      // Ignore
    }
  }

  if (!configuredAppHost) {
    configuredAppHost = DEFAULT_APP_HOST;
  }

  const patterns = [
    ...DEFAULT_PLATFORM_PATTERNS,
    ...(configuredAppHost ? [configuredAppHost, `www.${configuredAppHost}`] : []),
    ...envList,
    ...(customPlatformHosts || []).map((s) => s.trim().toLowerCase()),
  ];

  for (const pattern of patterns) {
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(1); // e.g. .web.app
      if (host.endsWith(suffix) || host === pattern.slice(2)) {
        return true;
      }
    } else if (host === pattern) {
      return true;
    }
  }

  return false;
}

/**
 * Normalizes input parameters for resolveRoute supporting both object and positional signatures.
 */
function parseRouteInputs(
  hostnameOrOptions?: string | RouteOptions,
  pathArg?: string,
  searchArg?: string
): { hostname: string; pathname: string; search: string; hash: string } {
  let hostname = '';
  let pathname = '';
  let search = '';
  let hash = '';

  if (typeof hostnameOrOptions === 'object' && hostnameOrOptions !== null) {
    hostname = hostnameOrOptions.hostname || '';
    pathname = hostnameOrOptions.path || hostnameOrOptions.pathname || '';
    search = hostnameOrOptions.search || '';
    hash = hostnameOrOptions.hash || '';
  } else if (typeof hostnameOrOptions === 'string') {
    hostname = hostnameOrOptions;
    pathname = pathArg || '';
    if (searchArg?.startsWith('#')) {
      hash = searchArg;
      search = '';
    } else if (searchArg?.includes('#')) {
      const parts = searchArg.split('#');
      search = parts[0];
      hash = parts[1] || '';
    } else {
      search = searchArg || '';
    }
  } else if (typeof window !== 'undefined') {
    hostname = window.location.hostname || '';
    pathname = window.location.pathname || '';
    search = window.location.search || '';
    hash = window.location.hash || '';
  }

  if (pathname.includes('?')) {
    const [p, s] = pathname.split('?');
    pathname = p;
    if (!search) search = s;
  }
  if (pathname.includes('#')) {
    const [p, h] = pathname.split('#');
    pathname = p;
    if (!hash) hash = h;
  }

  return {
    hostname: hostname.toLowerCase().trim(),
    pathname: pathname.replace(/^\/+/, '').replace(/\/+$/, ''),
    search: search.trim(),
    hash: hash.replace(/^#\/?/, '').toLowerCase().trim(),
  };
}

/**
 * Resolves the route based on hostname, path, and search parameters.
 * Returns one of: 'landing' | 'studio' | 'profile' | 'domain' | '404'
 */
export function resolveRoute(
  hostnameOrOptions?: string | RouteOptions,
  pathArg?: string,
  searchArg?: string
): RouteType {
  const { hostname, pathname, search, hash } = parseRouteInputs(
    hostnameOrOptions,
    pathArg,
    searchArg
  );

  const searchParams = new URLSearchParams(
    search.startsWith('?') ? search : search ? `?${search}` : ''
  );

  // 1. Studio overrides via search query or hash take precedence (?view=studio, ?edit=true, #studio)
  if (
    searchParams.get('view') === 'studio' ||
    searchParams.get('edit') === 'true' ||
    hash === 'studio' ||
    pathname === 'studio'
  ) {
    return 'studio';
  }

  // 2. Custom domain check: any hostname not in platform hosts and not VITE_APP_HOST
  if (hostname && !isPlatformHost(hostname)) {
    return 'domain';
  }

  // 3. Explicit custom domain override via query parameters (?domain=... or ?d=...)
  const domainParam = searchParams.get('domain') || searchParams.get('d');
  if (domainParam && domainParam.trim()) {
    return 'domain';
  }

  // 4. Explicit user query param override (?user=... or ?u=...)
  const userParam = searchParams.get('user') || searchParams.get('u');
  if (userParam && userParam.trim()) {
    const cleanUser = userParam.trim().toLowerCase().replace(/^@/, '');
    if (RESERVED.has(cleanUser)) {
      return '404';
    }
    return 'profile';
  }

  // 5. Inspect path segments
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0 || pathname === '' || pathname === 'index.html') {
    // Hash-based profile route (e.g. #/johndoe or #johndoe or #@johndoe)
    if (
      hash &&
      hash !== 'dashboard' &&
      hash !== 'explore' &&
      hash !== 'landing'
    ) {
      const cleanHash = hash.replace(/^@/, '');
      if (RESERVED.has(cleanHash)) {
        return '404';
      }
      return 'profile';
    }
    return 'landing';
  }

  // /app/studio or /app/:username
  if (segments[0].toLowerCase() === 'app') {
    if (segments[1] && segments[1].toLowerCase() === 'studio') {
      return 'studio';
    }
    if (segments[1]) {
      const cleanUser = segments[1].toLowerCase().replace(/^@/, '');
      if (RESERVED.has(cleanUser)) {
        return '404';
      }
      return 'profile';
    }
    return 'landing';
  }

  // Reserved path check
  const first = segments[0].toLowerCase().replace(/^@/, '');
  if (RESERVED.has(first)) {
    if (first === 'studio') return 'studio';
    return '404';
  }

  // Multi-segment paths that are not handled
  if (segments.length > 1) {
    return '404';
  }

  // Single valid username segment (e.g. /johndoe or /@johndoe)
  return 'profile';
}

/**
 * Extracts the route target (username or custom domain) from route inputs.
 */
export function getRouteTarget(
  hostnameOrOptions?: string | RouteOptions,
  pathArg?: string,
  searchArg?: string
): string | null {
  const { hostname, pathname, search, hash } = parseRouteInputs(
    hostnameOrOptions,
    pathArg,
    searchArg
  );

  const route = resolveRoute(hostnameOrOptions, pathArg, searchArg);

  if (route === 'domain') {
    const searchParams = new URLSearchParams(
      search.startsWith('?') ? search : search ? `?${search}` : ''
    );
    const domainParam = searchParams.get('domain') || searchParams.get('d');
    if (domainParam && domainParam.trim()) {
      return domainParam.trim().toLowerCase();
    }
    return hostname || null;
  }

  if (route === 'profile') {
    const searchParams = new URLSearchParams(
      search.startsWith('?') ? search : search ? `?${search}` : ''
    );
    const userParam = searchParams.get('user') || searchParams.get('u');
    if (userParam && userParam.trim()) {
      return userParam.trim().toLowerCase().replace(/^@/, '');
    }

    const segments = pathname.split('/').filter(Boolean);
    if (segments[0]?.toLowerCase() === 'app' && segments[1]) {
      return segments[1].toLowerCase().replace(/^@/, '');
    }
    if (segments[0]) {
      return segments[0].toLowerCase().replace(/^@/, '');
    }
    if (hash) {
      return hash.toLowerCase().replace(/^@/, '');
    }
  }

  return null;
}
