export const siteSeo = {
  name: 'LS Image Compressor',
  shortName: 'LS Compressor',
  url: 'https://img.ladestack.in',
  twitter: '@ladestack',
  defaultOg: 'https://img.ladestack.in/og-image.png',
  defaultImage: { width: 1200, height: 630 },
};

export interface PageSEO {
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  keywords: string;
  canonical: string;
  ogImage: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  jsonLd?: object | object[] | null;
}

const ORG = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Lade Stack',
  url: 'https://ladestack.in',
  logo: 'https://img.ladestack.in/logo-mark.svg',
  sameAs: [
    'https://github.com/girishlade111',
    'https://www.linkedin.com/in/girish-lade-075bba201/',
    'https://www.instagram.com/girish_lade_/',
    'https://codepen.io/Girish-Lade-the-looper',
    'https://twitter.com/ladestack',
  ],
};

export const pageSeo: Record<string, PageSEO> = {
  home: {
    title: 'Free Online Image Compressor — Up to 90% Smaller & Private',
    shortTitle: 'LS Image Compressor — Compress Up to 90% Free',
    description:
      'Free online image compressor that runs 100% in your browser — no upload, no signup, no watermark. Compress JPG, PNG, WebP, AVIF up to 90% smaller. Batch up to 50 images, resize for social media, convert formats. Privacy-first and forever free.',
    shortDescription:
      'Compress images up to 90% smaller in your browser. 100% free, no upload, no signup.',
    keywords:
      'image compressor, compress image, online image compressor, free image compressor, WebP converter, AVIF converter, image resizer, JPG compressor, PNG compressor, batch image compression, privacy-first, browser-based, no upload, Lade Stack',
    canonical: 'https://img.ladestack.in/',
    ogImage: 'https://img.ladestack.in/og-image.png',
    jsonLd: null,
  },
  pdf: {
    title: 'Free PDF Compressor — Shrink PDF Files Up to 90% in Browser',
    shortTitle: 'Free PDF Compressor — Shrink PDFs Up to 90%',
    description:
      'Compress PDF files up to 90% smaller right in your browser — no upload, no signup, no watermark. Three quality presets (Strong, Balanced, Light), batch up to 5 PDFs at 100 MB each. Text in output is rasterized (not selectable) but every byte stays on your device.',
    shortDescription:
      'Shrink PDFs up to 90% in your browser. Free, private, no upload, no signup.',
    keywords:
      'PDF compressor, compress PDF, online PDF compressor, free PDF compressor, shrink PDF, reduce PDF size, PDF optimizer, browser-based PDF, privacy-first, no upload, Lade Stack',
    canonical: 'https://img.ladestack.in/compress-pdf',
    ogImage: 'https://img.ladestack.in/og-pdf.png',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'LS Image Compressor — PDF Compressor',
        url: 'https://img.ladestack.in/compress-pdf',
        description:
          'Free online PDF compressor. Shrink PDF files up to 90% smaller in your browser with no upload.',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        browserRequirements:
          'Requires a modern web browser with JavaScript, HTML5 Canvas, and WebAssembly support',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Organization', name: 'Lade Stack', url: 'https://ladestack.in' },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '150',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to compress a PDF online for free',
        description:
          'Step-by-step guide to compress PDF files up to 90% smaller using LS Image Compressor in your browser. No upload, no signup, no watermark.',
        totalTime: 'PT2M',
        estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Upload your PDFs',
            text: 'Drag and drop up to 5 PDF files (100 MB each) into the upload zone, or click to browse. Files never leave your device.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Choose compression preset',
            text: 'Pick Strong (smallest), Balanced (recommended), or Light (highest quality). The quality slider lets you fine-tune.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Download compressed PDFs',
            text: 'Hit the Compress button. When processing finishes, download each PDF individually or all as a ZIP.',
          },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is text in the compressed PDF still selectable?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. The compressed PDF contains re-rendered JPEG images for every page, so text becomes part of the image. This is the trade-off for getting 80–90% file size reduction in the browser.',
            },
          },
          {
            '@type': 'Question',
            name: 'How much can I shrink a PDF?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'On image-heavy PDFs (scans, presentations, photo books) expect 70–90% reduction. On text-heavy PDFs the reduction is smaller (10–40%) because the text layer doesn’t compress as well as the images.',
            },
          },
        ],
      },
    ],
  },
  rename: {
    title: 'Bulk File Rename — 13 Live Rules, Preview & ZIP Download',
    shortTitle: 'Bulk File Rename — 13 Rules + Live Preview',
    description:
      'Rename hundreds of files in seconds with a 13-rule engine: find and replace (with regex), prefix, suffix, numbering, case conversion, whitespace, character removal, date stamping, insert at position, trim, extension change, counter extract, reverse. Live preview with diff highlight. Download as ZIP. 100% in browser, no upload.',
    shortDescription:
      'Rename 100 files at once with 13 rules. Live preview, ZIP download, 100% private.',
    keywords:
      'bulk file renamer, rename files, batch rename, file rename, regex rename, numbering, date rename, case converter, file manager, ZIP download, browser-based, privacy-first, no upload, Lade Stack',
    canonical: 'https://img.ladestack.in/bulk-rename',
    ogImage: 'https://img.ladestack.in/og-rename.png',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'LS Image Compressor — Bulk File Renamer',
        url: 'https://img.ladestack.in/bulk-rename',
        description:
          'Free bulk file renamer with 13 live rules, preview with diff highlight, and ZIP download. 100% in browser, no upload.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires a modern web browser with JavaScript support',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Organization', name: 'Lade Stack', url: 'https://ladestack.in' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to bulk rename files for free',
        description:
          'Rename hundreds of files at once using LS Image Compressor’s 13-rule engine, with live preview and ZIP download. 100% in browser.',
        totalTime: 'PT1M',
        estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Add your files',
            text: 'Drag and drop up to 100 files (200 MB total) into the upload zone, or click to browse. Files never leave your device.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Stack rename rules',
            text: 'Add up to 13 rules in any order: find and replace, prefix, suffix, numbering, case, whitespace, character removal, date, insert, trim, extension, counter, reverse. See a live preview as you build.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Download the renamed ZIP',
            text: 'Hit Download ZIP to get all renamed files in a single archive.',
          },
        ],
      },
    ],
  },
  about: {
    title: 'About — The Story Behind LS Image Compressor',
    shortTitle: 'About LS Image Compressor',
    description:
      'LS Image Compressor is a privacy-first image, PDF, and file-rename toolkit built in India by a solo developer. Read the story, meet the founder, see the stack, and read the privacy pledge.',
    shortDescription:
      'The story behind LS Image Compressor. Privacy-first tools, built by a solo dev in India.',
    keywords:
      'about LS Image Compressor, Lade Stack, Girish Lade, privacy-first tools, solo developer, indie hacker, image compression story',
    canonical: 'https://img.ladestack.in/about',
    ogImage: 'https://img.ladestack.in/og-about.png',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About LS Image Compressor',
        url: 'https://img.ladestack.in/about',
        description:
          'The story behind LS Image Compressor — a privacy-first toolkit built by Girish Lade in India.',
        isPartOf: { '@type': 'WebSite', name: 'LS Image Compressor', url: 'https://img.ladestack.in/' },
        about: {
          ...ORG,
          founder: {
            '@type': 'Person',
            name: 'Girish Lade',
            jobTitle: 'Founder & Solo Developer',
            url: 'https://ladestack.in',
            sameAs: [
              'https://github.com/girishlade111',
              'https://www.linkedin.com/in/girish-lade-075bba201/',
              'https://www.instagram.com/girish_lade_/',
              'https://codepen.io/Girish-Lade-the-looper',
              'https://twitter.com/ladestack',
            ],
          },
        },
      },
    ],
  },
  contact: {
    title: 'Contact — Say Hello to LS Image Compressor',
    shortTitle: 'Contact LS Image Compressor',
    description:
      'Get in touch with the LS Image Compressor team. Email, GitHub, Instagram, LinkedIn, and more. Replies within 24 to 48 hours on business days. Based in India, working worldwide.',
    shortDescription:
      'Email, GitHub, social — all the ways to reach LS Image Compressor.',
    keywords:
      'contact LS Image Compressor, email Lade Stack, support, partnership, bug report, feature request, Lade Stack',
    canonical: 'https://img.ladestack.in/contact',
    ogImage: 'https://img.ladestack.in/og-contact.png',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact LS Image Compressor',
        url: 'https://img.ladestack.in/contact',
        description:
          'Contact information for LS Image Compressor — email, GitHub, social profiles.',
        isPartOf: { '@type': 'WebSite', name: 'LS Image Compressor', url: 'https://img.ladestack.in/' },
        about: { ...ORG, email: 'admin@ladestack.in' },
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy — How LS Image Compressor Handles Your Data',
    shortTitle: 'Privacy Policy — LS Image Compressor',
    description:
      'LS Image Compressor runs 100% in your browser. Your images, PDFs, and renamed files never leave your device. Read the full privacy policy to understand exactly what we do and do not do with your data.',
    shortDescription:
      'Privacy policy for LS Image Compressor. Spoiler: we don’t collect anything.',
    keywords:
      'privacy policy, data handling, no tracking, no cookies, client-side processing, LS Image Compressor',
    canonical: 'https://img.ladestack.in/privacy',
    ogImage: 'https://img.ladestack.in/og-privacy.png',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'PrivacyPolicy',
        name: 'LS Image Compressor Privacy Policy',
        url: 'https://img.ladestack.in/privacy',
        dateModified: '2026-03-08',
        isPartOf: { '@type': 'WebSite', name: 'LS Image Compressor', url: 'https://img.ladestack.in/' },
        publisher: { '@type': 'Organization', name: 'Lade Stack', url: 'https://ladestack.in' },
      },
    ],
  },
  terms: {
    title: 'Terms of Service — LS Image Compressor',
    shortTitle: 'Terms of Service — LS Image Compressor',
    description:
      'Terms of service for LS Image Compressor. Free for personal and commercial use, no warranty, no liability, your files stay on your device.',
    shortDescription:
      'Terms of service for LS Image Compressor. Free, no warranty, client-side.',
    keywords:
      'terms of service, legal, free image compressor, no warranty, LS Image Compressor',
    canonical: 'https://img.ladestack.in/terms',
    ogImage: 'https://img.ladestack.in/og-terms.png',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'LS Image Compressor Terms of Service',
        url: 'https://img.ladestack.in/terms',
        dateModified: '2026-03-08',
        isPartOf: { '@type': 'WebSite', name: 'LS Image Compressor', url: 'https://img.ladestack.in/' },
        publisher: { '@type': 'Organization', name: 'Lade Stack', url: 'https://ladestack.in' },
      },
    ],
  },
  notFound: {
    title: '404 — Page Not Found',
    shortTitle: '404 — Page Not Found',
    description:
      'The page you were looking for does not exist. Return to LS Image Compressor home or try one of our tools.',
    shortDescription: '404 — page not found on LS Image Compressor.',
    keywords: '404, not found, page missing',
    canonical: 'https://img.ladestack.in/404',
    ogImage: 'https://img.ladestack.in/og-image.png',
    noindex: true,
    jsonLd: null,
  },
};
