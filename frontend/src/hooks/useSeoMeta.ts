import { useEffect } from 'react';
import { getImageUrl } from '../lib/utils';

interface SeoMetaOptions {
  title?: string;
  description?: string;
  image?: string;         // relative path from API (e.g. "uploads/cover.jpg")
  imageUrl?: string;      // full absolute URL (takes precedence over image)
  type?: 'website' | 'article';
  url?: string;
  siteName?: string;
  keywords?: string;
  noIndex?: boolean;
}

/**
 * useSeoMeta – Reusable hook to dynamically inject SEO + OpenGraph + Twitter Card
 * meta tags into the <head> of the document on every page/detail view.
 *
 * Supports:
 *  - <title>
 *  - <meta name="description">
 *  - <meta name="keywords">
 *  - <meta property="og:*">     (Facebook, WhatsApp, Telegram etc.)
 *  - <meta name="twitter:*">    (Twitter / X Card)
 *  - <link rel="canonical">
 */
export function useSeoMeta(options: SeoMetaOptions) {
  useEffect(() => {
    const {
      title,
      description,
      image,
      imageUrl,
      type = 'website',
      url = window.location.href,
      siteName = document.title,
      keywords,
      noIndex = false,
    } = options;

    // Derive the canonical absolute image URL
    const resolvedImage = imageUrl
      ? imageUrl
      : image
      ? `${window.location.protocol}//${window.location.host}${getImageUrl(image)}`
      : null;

    const fullTitle = title || document.title;

    // ── 1. Document title ──────────────────────────────────────────────
    if (title) document.title = title;

    // ── helper: upsert a <meta> tag ────────────────────────────────────
    const upsertMeta = (attr: string, attrValue: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // ── helper: upsert a <link> tag ────────────────────────────────────
    const upsertLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // ── 2. Standard SEO ────────────────────────────────────────────────
    if (description) upsertMeta('name', 'description', description);
    if (keywords)    upsertMeta('name', 'keywords', keywords);
    if (noIndex)     upsertMeta('name', 'robots', 'noindex, nofollow');
    else             upsertMeta('name', 'robots', 'index, follow');

    // Canonical URL
    upsertLink('canonical', url);

    // ── 3. OpenGraph (Facebook, WhatsApp, Telegram) ────────────────────
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:url', url);
    if (siteName)         upsertMeta('property', 'og:site_name', siteName);
    if (description)      upsertMeta('property', 'og:description', description);
    if (resolvedImage) {
      upsertMeta('property', 'og:image', resolvedImage);
      upsertMeta('property', 'og:image:width', '1200');
      upsertMeta('property', 'og:image:height', '630');
      upsertMeta('property', 'og:image:alt', fullTitle);
    }

    // ── 4. Twitter / X Card ────────────────────────────────────────────
    upsertMeta('name', 'twitter:card', resolvedImage ? 'summary_large_image' : 'summary');
    upsertMeta('name', 'twitter:title', fullTitle);
    if (description)   upsertMeta('name', 'twitter:description', description);
    if (resolvedImage) upsertMeta('name', 'twitter:image', resolvedImage);

    // ── Cleanup: reset to default when component unmounts ─────────────
    return () => {
      document.title = 'Pesantren Portal';
      upsertMeta('name', 'robots', 'index, follow');
    };
  // Stringify to avoid re-running on every render for object references
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options)]);
}
