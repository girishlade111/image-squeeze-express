import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const escapeXml = (unsafe) =>
  String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const ogImages = [
  {
    name: 'og-image.png',
    title: 'LS Image Compressor',
    subtitle: 'Free Online Image Compressor',
    tagline: 'Compress up to 90% · 100% Private · Free Forever',
  },
  {
    name: 'og-pdf.png',
    title: 'Compress PDFs Free',
    subtitle: 'Shrink PDF Files Up to 90%',
    tagline: '3 quality presets · 5 PDFs at a time · 100% in browser',
  },
  {
    name: 'og-rename.png',
    title: 'Bulk File Rename',
    subtitle: '13 Rules · Live Preview · ZIP Download',
    tagline: 'Rename 100 files in seconds · Regex · Numbering · 100% Private',
  },
  {
    name: 'og-about.png',
    title: 'About LS Image Compressor',
    subtitle: 'The Story, Stack, and Pledge',
    tagline: 'A privacy-first toolkit built by Lade Stack in India',
  },
  {
    name: 'og-contact.png',
    title: 'Contact LS Image Compressor',
    subtitle: 'Email · GitHub · Social',
    tagline: 'Replies within 24-48 hours · Based in India',
  },
  {
    name: 'og-privacy.png',
    title: 'Privacy Policy',
    subtitle: 'How We Handle Your Data',
    tagline: "Spoiler: we don't collect anything. Your files never leave your device.",
  },
  {
    name: 'og-terms.png',
    title: 'Terms of Service',
    subtitle: 'Free · No Warranty · No Liability',
    tagline: 'Free for personal and commercial use — your files stay on your device.',
  },
];

function makeSvg({ title, subtitle, tagline }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4F46E5"/>
      <stop offset="100%" stop-color="#0D9488"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#shine)"/>

  <!-- Decorative blobs -->
  <circle cx="80" cy="540" r="180" fill="#ffffff" fill-opacity="0.08"/>
  <circle cx="1120" cy="100" r="140" fill="#ffffff" fill-opacity="0.10"/>

  <!-- Logo mark (left) -->
  <g transform="translate(100, 100)">
    <rect width="120" height="120" rx="26" fill="#ffffff"/>
    <g fill="none" stroke="#4F46E5" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18,34 42,60 18,86"/>
      <polyline points="102,34 78,60 102,86"/>
    </g>
    <path d="M60 49 L62.5 57 L70.5 60 L62.5 63 L60 71 L57.5 63 L49.5 60 L57.5 57 Z" fill="#4F46E5"/>
  </g>
  <text x="250" y="170" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="32" font-weight="700" fill="#ffffff" fill-opacity="0.95">LS Image Compressor</text>
  <text x="250" y="200" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="#ffffff" fill-opacity="0.7">img.ladestack.in</text>

  <!-- Main title -->
  <text x="100" y="380" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="80" font-weight="800" fill="#ffffff">${escapeXml(title)}</text>

  <!-- Subtitle -->
  <text x="100" y="445" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="36" font-weight="500" fill="#ffffff" fill-opacity="0.92">${escapeXml(subtitle)}</text>

  <!-- Tagline pill -->
  <rect x="100" y="510" width="1000" height="56" rx="28" fill="#ffffff" fill-opacity="0.15"/>
  <text x="600" y="546" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="22" font-weight="600" fill="#ffffff" fill-opacity="0.95" text-anchor="middle">${escapeXml(tagline)}</text>
</svg>`;
}

async function main() {
  for (const img of ogImages) {
    const svg = makeSvg(img);
    const svgPath = join(publicDir, img.name.replace('.png', '.svg'));
    const pngPath = join(publicDir, img.name);

    await writeFile(svgPath, svg, 'utf8');
    await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9, palette: false })
      .toFile(pngPath);

    console.log(`OK  ${img.name}`);
  }
  console.log(`\nGenerated ${ogImages.length} OG images (PNG + SVG).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
