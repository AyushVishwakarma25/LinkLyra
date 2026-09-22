import { useEffect } from 'react';

export interface DocumentMetaOptions {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  url?: string;
  type?: string;
}

const DEFAULT_META: DocumentMetaOptions = {
  title: 'LinkLyra - The Link-in-Bio for Modern Creators',
  description: 'Create a high-converting, dynamic bio page with direct lead capture, multi-platform media routing, and real-time analytics.',
  image: 'https://linklyra.web.app/og-preview.png',
  type: 'website',
};

function updateOrCreateMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateOrCreateCanonical(canonicalUrl: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', canonicalUrl);
}

/**
 * Custom hook to dynamically manage document head metadata:
 * - document.title
 * - <meta name="description">
 * - <link rel="canonical">
 * - og:title, og:description, og:image, og:url, og:type
 * - twitter:card, twitter:title, twitter:description, twitter:image
 */
export function useDocumentMeta(options: DocumentMetaOptions) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const title = options.title || DEFAULT_META.title!;
    const description = options.description || DEFAULT_META.description!;
    const image = options.image || DEFAULT_META.image!;
    const url = options.url || (typeof window !== 'undefined' ? window.location.href : '');
    const canonical = options.canonical || url;
    const type = options.type || 'profile';

    // 1. Title
    document.title = title;

    // 2. Standard description & canonical
    updateOrCreateMetaTag('name', 'description', description);
    if (canonical) {
      updateOrCreateCanonical(canonical);
    }

    // 3. Open Graph
    updateOrCreateMetaTag('property', 'og:title', title);
    updateOrCreateMetaTag('property', 'og:description', description);
    updateOrCreateMetaTag('property', 'og:image', image);
    updateOrCreateMetaTag('property', 'og:url', canonical);
    updateOrCreateMetaTag('property', 'og:type', type);
    updateOrCreateMetaTag('property', 'og:site_name', 'LinkLyra');

    // 4. Twitter Card
    updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMetaTag('name', 'twitter:title', title);
    updateOrCreateMetaTag('name', 'twitter:description', description);
    updateOrCreateMetaTag('name', 'twitter:image', image);

    return () => {
      // Reset to defaults on unmount
      if (typeof document !== 'undefined') {
        document.title = DEFAULT_META.title!;
        updateOrCreateMetaTag('name', 'description', DEFAULT_META.description!);
      }
    };
  }, [options.title, options.description, options.canonical, options.image, options.url, options.type]);
}
