import { useLayoutEffect } from 'react';
import { siteSeo } from '@/config/seo';

export interface DocumentTitleProps {
  title: string;
  description?: string;
  shortTitle?: string;
  shortDescription?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  noindex?: boolean;
  jsonLd?: object | object[] | null;
  suffix?: string;
}

const OG_FAMILY = /^(og:|article:|profile:|al:|music:|video:|book:)/;
const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const ROBOTS_NOINDEX = 'noindex, nofollow';

function setMeta(name: string, content: string) {
  if (typeof document === 'undefined' || !content) return;
  const attr = OG_FAMILY.test(name) ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  if (typeof document === 'undefined' || !href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function injectJsonLd(data: object | object[]) {
  if (typeof document === 'undefined') return;
  document.head.querySelectorAll('script[data-page-jsonld]').forEach((s) => s.remove());
  const items = Array.isArray(data) ? data : [data];
  items.forEach((d, i) => {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-page-jsonld', String(i));
    s.textContent = JSON.stringify(d);
    document.head.appendChild(s);
  });
}

const DocumentTitle = ({
  title,
  description,
  shortTitle,
  shortDescription,
  keywords,
  canonical,
  ogImage = siteSeo.defaultOg,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noindex = false,
  jsonLd = null,
  suffix = siteSeo.name,
}: DocumentTitleProps) => {
  useLayoutEffect(() => {
    const fullTitle = suffix && !title.includes(suffix) ? `${title} · ${suffix}` : title;
    if (document.title !== fullTitle) document.title = fullTitle;

    if (description) setMeta('description', description);
    if (shortDescription) {
      setMeta('description:short', shortDescription);
      setMeta('twitter:description:short', shortDescription);
      setMeta('og:description:short', shortDescription);
    }
    if (keywords) setMeta('keywords', keywords);
    if (shortTitle) {
      setMeta('title:short', shortTitle);
      setMeta('og:title:short', shortTitle);
      setMeta('twitter:title:short', shortTitle);
    }

    setMeta('author', 'Lade Stack');
    setMeta('designer', 'Girish Lade');
    setMeta('developer', 'Lade Stack');
    setMeta('reply-to', siteSeo.email);
    setMeta('owner', `Lade Stack — ${siteSeo.email}`);
    setMeta('copyright', 'Copyright © 2026 Lade Stack. All rights reserved.');
    setMeta('category', 'Multimedia, Utilities, Productivity');
    setMeta('coverage', siteSeo.coverage);
    setMeta('distribution', siteSeo.distribution);
    setMeta('rating', siteSeo.rating);
    setMeta('revisit-after', siteSeo.revisitAfter);
    setMeta('robots', noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX);
    setMeta('googlebot', noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX);
    setMeta('bingbot', noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX);
    setMeta('language', 'English');
    setMeta('geo.region', siteSeo.geo.region);
    setMeta('geo.placename', siteSeo.geo.placename);
    setMeta('geo.position', siteSeo.geo.position);
    setMeta('ICBM', siteSeo.geo.icbm);
    setMeta('og:country-name', siteSeo.geo.region);

    const ogTitle = shortTitle || title;
    const ogDesc = shortDescription || description || '';
    const ogUrl =
      canonical || (typeof window !== 'undefined' ? window.location.href : siteSeo.url);

    setMeta('og:title', ogTitle);
    setMeta('og:description', ogDesc);
    setMeta('og:type', ogType);
    setMeta('og:url', ogUrl);
    setMeta('og:image', ogImage);
    setMeta('og:image:secure_url', ogImage);
    setMeta('og:image:width', String(siteSeo.defaultImage.width));
    setMeta('og:image:height', String(siteSeo.defaultImage.height));
    setMeta('og:image:alt', ogTitle);
    setMeta('og:site_name', siteSeo.name);
    setMeta('og:locale', siteSeo.locale);
    setMeta('og:locale:alternate', 'en_IN');
    setMeta('og:locale:alternate', 'en_GB');
    setMeta('og:updated_time', new Date().toISOString());

    setMeta('twitter:card', twitterCard);
    setMeta('twitter:title', ogTitle);
    setMeta('twitter:description', ogDesc);
    setMeta('twitter:image', ogImage);
    setMeta('twitter:image:alt', ogTitle);
    setMeta('twitter:url', ogUrl);
    setMeta('twitter:site', siteSeo.twitter);
    setMeta('twitter:creator', siteSeo.twitter);
    setMeta('twitter:domain', 'img.ladestack.in');
    setMeta('twitter:label1', 'Privacy');
    setMeta('twitter:data1', '100% Client-Side — No Upload');
    setMeta('twitter:label2', 'Price');
    setMeta('twitter:data2', 'Free Forever');
    setMeta('twitter:label3', 'Formats');
    setMeta('twitter:data3', 'JPG, PNG, WebP, AVIF, PDF');
    setMeta('twitter:label4', 'Batch Size');
    setMeta('twitter:data4', 'Up to 50 images / 750 MB');

    setMeta('article:author', 'https://ladestack.in');
    setMeta('article:publisher', 'https://ladestack.in');
    setMeta('article:section', 'Technology');

    if (canonical) setLink('canonical', canonical);

    if (jsonLd && (Array.isArray(jsonLd) ? jsonLd.length > 0 : true)) {
      injectJsonLd(jsonLd);
    }
  }, [
    title,
    description,
    shortTitle,
    shortDescription,
    keywords,
    canonical,
    ogImage,
    ogType,
    twitterCard,
    noindex,
    jsonLd,
    suffix,
  ]);

  return null;
};

export default DocumentTitle;
