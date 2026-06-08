export const siteSeo = {
  name: 'LS Image Compressor',
  shortName: 'LS Compressor',
  url: 'https://img.ladestack.in',
  twitter: '@ladestack',
  defaultOg: 'https://img.ladestack.in/og-image.png',
  defaultImage: { width: 1200, height: 630 },
  email: 'admin@ladestack.in',
  founderName: 'Girish Lade',
  legalName: 'Lade Stack',
  legalUrl: 'https://ladestack.in',
  locale: 'en_US',
  rating: 'General',
  distribution: 'Global',
  coverage: 'Worldwide',
  revisitAfter: '3 days',
  geo: { region: 'IN', placename: 'India', position: '20.5937;78.9629', icbm: '20.5937, 78.9629' },
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
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
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
    title: 'Free Online Image Compressor — Up to 90% Smaller & Private in Your Browser',
    shortTitle: 'LS Image Compressor — Compress Up to 90% Free',
    description:
      'Free online image compressor that runs 100% in your browser — no upload, no signup, no watermark, no tracking, no cookies. Compress JPG, PNG, WebP and AVIF up to 90% smaller in seconds. Batch up to 50 images at a time (750 MB total, 25 MB per file), resize for Instagram, LinkedIn, Twitter, WhatsApp, YouTube and Facebook, convert to modern WebP/AVIF for faster websites, strip EXIF, rotate, mirror and grayscale. PDF compressor shrinks PDFs up to 90% with three quality presets. Bulk renamer handles 100 files with 13 live rules. Built in India by Lade Stack. Free forever.',
    shortDescription:
      'Compress images up to 90% smaller in your browser. 100% free, no upload, no signup, no watermark, no tracking.',
    keywords:
      'image compressor, compress image, online image compressor, free image compressor, WebP converter, AVIF converter, image resizer, JPG compressor, PNG compressor, compress JPG, compress PNG, compress WebP, compress AVIF, batch image compression, image optimizer, image size reducer, photo compressor, shrink image, reduce image size, lossy compression, lossless compression, EXIF strip, social media image sizes, Instagram post size, Instagram story size, LinkedIn post size, YouTube thumbnail size, Twitter image size, Facebook cover size, WhatsApp image size, WebP vs JPEG, AVIF vs WebP, page speed, web performance, privacy-first, browser-based, no upload, no signup, no watermark, no tracking, free online tools, free forever, Lade Stack, Girish Lade, made in India',
    canonical: 'https://img.ladestack.in/',
    ogImage: 'https://img.ladestack.in/og-image.png',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    jsonLd: [
      // The landing page is the most important URL to rank, so it carries the
      // richest structured data: the app itself (with ratings), the website
      // entity (enables the Google sitelinks search box), the publishing
      // organization, and the on-page FAQ.
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'LS Image Compressor',
        url: 'https://img.ladestack.in/',
        description:
          'Free online image compressor that runs 100% in your browser. Compress JPG, PNG, WebP and AVIF up to 90% smaller with no upload, no signup, no watermark, no tracking.',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        browserRequirements:
          'Requires a modern web browser with JavaScript, HTML5 Canvas, and WebAssembly support',
        featureList: [
          'Compress JPG, PNG, WebP and AVIF up to 90% smaller',
          'Batch up to 50 images at once (750 MB total)',
          'Resize for Instagram, LinkedIn, Twitter, WhatsApp, YouTube and Facebook',
          'Convert to modern WebP and AVIF',
          'Strip EXIF metadata, rotate, mirror and grayscale',
          'PDF compressor with three quality presets',
          'Bulk file renamer with 13 live rules',
        ],
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Organization', name: 'Lade Stack', url: 'https://ladestack.in' },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '320',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'LS Image Compressor',
        alternateName: 'LS Compressor',
        url: 'https://img.ladestack.in/',
        publisher: { '@type': 'Organization', name: 'Lade Stack', url: 'https://ladestack.in' },
      },
      ORG,
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is LS Image Compressor really free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Every tool — image compressor, PDF compressor and bulk renamer — is 100% free with no signup, no watermark, no usage limit and no hidden paid tier.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do my images get uploaded to a server?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. All compression runs entirely in your browser using your own device. Your images, PDFs and files never leave your computer and are never uploaded anywhere.',
            },
          },
          {
            '@type': 'Question',
            name: 'How much smaller can I make my images?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Most JPG, PNG, WebP and AVIF images compress 60–90% smaller with little visible quality loss. You control the quality with a slider and see the result before downloading.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which image formats are supported?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can compress and convert between JPG, PNG, WebP and AVIF. You can also compress PDF files and bulk-rename any file type.',
            },
          },
        ],
      },
    ],
  },
  pdf: {
    title: 'Free PDF Compressor — Shrink PDF Files Up to 90% in Your Browser',
    shortTitle: 'Free PDF Compressor — Shrink PDFs Up to 90%',
    description:
      'Compress PDF files up to 90% smaller right in your browser — no upload, no signup, no watermark, no tracking. Three quality presets (Strong, Balanced, Light), batch up to 5 PDFs at 100 MB each, custom JPEG quality, DPI override, target file size iteration, grayscale, metadata strip, page range selection, and a custom filename pattern with tokens. Text in the output is rasterized (not selectable) but every byte stays on your device. Built in India by Lade Stack.',
    shortDescription:
      'Shrink PDFs up to 90% in your browser. Free, private, no upload, no signup, no watermark.',
    keywords:
      'PDF compressor, compress PDF, online PDF compressor, free PDF compressor, shrink PDF, reduce PDF size, PDF optimizer, PDF size reducer, decrease PDF size, minimize PDF, PDF smaller, compress PDF online, batch PDF compression, browser-based PDF, in-browser PDF, privacy-first, no upload, no signup, no watermark, no tracking, Lade Stack, Girish Lade, made in India',
    canonical: 'https://img.ladestack.in/compress-pdf',
    ogImage: 'https://img.ladestack.in/og-pdf.png',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'LS Image Compressor — PDF Compressor',
        url: 'https://img.ladestack.in/compress-pdf',
        description:
          'Free online PDF compressor. Shrink PDF files up to 90% smaller in your browser with no upload, no signup, no watermark.',
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
              text: 'On image-heavy PDFs (scans, presentations, photo books) expect 70–90% reduction. On text-heavy PDFs the reduction is smaller (10–40%) because the text layer does not compress as well as the images.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I pick a target file size?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Enter a target size in KB and the PDF compressor will iteratively reduce quality and DPI to hit the target as closely as possible (up to 5 attempts).',
            },
          },
        ],
      },
    ],
  },
  rename: {
    title: 'Bulk File Rename — 13 Live Rules, Live Preview & ZIP Download',
    shortTitle: 'Bulk File Rename — 13 Rules + Live Preview',
    description:
      'Rename hundreds of files in seconds with a 13-rule engine: find and replace (with regex and case-insensitive toggle), prefix, suffix, numbering with custom separator and zero-padding, case conversion (lower, UPPER, Title, Sentence), whitespace normalization, character removal, date stamping in 7 formats, insert at position, trim, extension change, counter extraction, and reverse. Live preview with diff highlight shows every rename before you commit. Download as ZIP. 100% in browser, no upload, no signup, no tracking. Built in India by Lade Stack.',
    shortDescription:
      'Rename 100 files at once with 13 rules. Live preview, ZIP download, 100% private.',
    keywords:
      'bulk file renamer, rename files, batch rename, file rename, regex rename, regex find replace, file numbering, sequential numbering, zero pad, date rename, date stamp, case converter, lowercase, uppercase, title case, sentence case, whitespace normalizer, character removal, file manager, ZIP download, browser-based, privacy-first, no upload, no signup, no tracking, free online tool, Lade Stack, Girish Lade, made in India',
    canonical: 'https://img.ladestack.in/bulk-rename',
    ogImage: 'https://img.ladestack.in/og-rename.png',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'LS Image Compressor — Bulk File Renamer',
        url: 'https://img.ladestack.in/bulk-rename',
        description:
          'Free bulk file renamer with 13 live rules, preview with diff highlight, and ZIP download. 100% in browser, no upload, no signup.',
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
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Can I use regex in the find-and-replace rule?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Tick the Regex checkbox and the Find field is interpreted as a JavaScript regular expression. You can also toggle case-insensitive matching.',
            },
          },
          {
            '@type': 'Question',
            name: 'Will renamed files overwrite existing files?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. The renamer automatically de-duplicates by appending a counter (file (2), file (3), …) so every output has a unique name inside the ZIP.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is there a file-type restriction?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. You can rename any file type — documents, images, videos, audio, archives, code files. Up to 100 files per batch, 200 MB total.',
            },
          },
        ],
      },
    ],
  },
  about: {
    title: 'About — The Story Behind LS Image Compressor | Lade Stack',
    shortTitle: 'About LS Image Compressor',
    description:
      'LS Image Compressor is a privacy-first image, PDF, and file-rename toolkit built in India by a solo developer, Girish Lade. Read the story, meet the founder, see the stack, and read the privacy pledge that has guided every product decision since day one. From a 2024 weekend project to a global tool used by tens of thousands of people every month — all 100% in your browser, all 100% free.',
    shortDescription:
      'The story behind LS Image Compressor. Privacy-first tools, built by a solo developer in India.',
    keywords:
      'about LS Image Compressor, Lade Stack, Girish Lade, privacy-first tools, solo developer, indie hacker, image compression story, India startup, browser tools, open source spirit',
    canonical: 'https://img.ladestack.in/about',
    ogImage: 'https://img.ladestack.in/og-about.png',
    ogType: 'article',
    twitterCard: 'summary_large_image',
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
    title: 'Contact — Say Hello to LS Image Compressor | Lade Stack',
    shortTitle: 'Contact LS Image Compressor',
    description:
      'Get in touch with the LS Image Compressor team. Email, GitHub, Instagram, LinkedIn, and more. Replies within 24 to 48 hours on business days. Based in India, working worldwide. We love bug reports, feature requests, partnership ideas and general feedback.',
    shortDescription:
      'Email, GitHub, Instagram, LinkedIn — all the ways to reach LS Image Compressor.',
    keywords:
      'contact LS Image Compressor, email Lade Stack, support, partnership, bug report, feature request, feedback, India, made in India, customer support',
    canonical: 'https://img.ladestack.in/contact',
    ogImage: 'https://img.ladestack.in/og-contact.png',
    ogType: 'website',
    twitterCard: 'summary',
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
      'LS Image Compressor runs 100% in your browser. Your images, PDFs, and renamed files never leave your device. Read the full privacy policy to understand exactly what we do and do not do with your data: no upload, no signup, no cookies, no analytics tracking, no third-party scripts that read your files. Last updated March 8, 2026.',
    shortDescription:
      'Privacy policy for LS Image Compressor. Spoiler: we do not collect anything.',
    keywords:
      'privacy policy, data handling, no tracking, no cookies, no analytics, client-side processing, browser-only, LS Image Compressor, Lade Stack',
    canonical: 'https://img.ladestack.in/privacy',
    ogImage: 'https://img.ladestack.in/og-privacy.png',
    ogType: 'article',
    twitterCard: 'summary',
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
    title: 'Terms of Service — LS Image Compressor | Lade Stack',
    shortTitle: 'Terms of Service — LS Image Compressor',
    description:
      'Terms of service for LS Image Compressor. Free for personal and commercial use, no warranty, no liability, your files stay on your device, no account required. By using LS Image Compressor you agree to these terms. Last updated March 8, 2026.',
    shortDescription:
      'Terms of service for LS Image Compressor. Free, no warranty, client-side.',
    keywords:
      'terms of service, legal, free image compressor, no warranty, LS Image Compressor, Lade Stack, commercial use, no account',
    canonical: 'https://img.ladestack.in/terms',
    ogImage: 'https://img.ladestack.in/og-terms.png',
    ogType: 'article',
    twitterCard: 'summary',
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
    title: '404 — Page Not Found | LS Image Compressor',
    shortTitle: '404 — Page Not Found',
    description:
      'The page you were looking for does not exist. Return to LS Image Compressor home or try one of our three free tools: image compressor, PDF compressor, or bulk file renamer.',
    shortDescription: '404 — page not found on LS Image Compressor.',
    keywords: '404, not found, page missing, LS Image Compressor',
    canonical: 'https://img.ladestack.in/404',
    ogImage: 'https://img.ladestack.in/og-image.png',
    ogType: 'website',
    twitterCard: 'summary',
    noindex: true,
    jsonLd: null,
  },
};
