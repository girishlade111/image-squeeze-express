

# ImageSqueeze — AI-Powered Image Compressor, Resizer & WebP Converter

A fully client-side image processing tool with a modern dark-mode SaaS design. All processing happens in the browser — no uploads, no servers, 100% private.

## Pages & Layout

**Single-page app** with smooth scroll navigation between sections, wrapped in a dark glassmorphism theme (violet/cyan accent colors, Inter font).

---

## Section 1: Header & Navigation
- Gradient logo (lightning bolt + "ImageSqueeze"), dark/light mode toggle
- Nav links: Home, How It Works, FAQ
- Mobile hamburger menu

## Section 2: Hero
- Bold headline, privacy subheadline, 3 trust badges (Private, Instant, Free)
- Large drag-and-drop upload zone accepting up to 10 images (JPG, PNG, WebP, AVIF, GIF, BMP)
- Hover glow effect on upload zone

## Section 3: Settings Panel (appears after upload)
Three tabs:
- **Compress**: Quality slider (10–100%, default 75%), estimated size preview, target size input
- **Resize**: Width/height inputs with aspect ratio lock, 9 social media presets (Instagram, LinkedIn, WhatsApp, Twitter/X, Facebook, YouTube, Full HD)
- **Convert**: Radio buttons for JPEG, PNG, WebP (recommended), or Keep Original

## Section 4: Image Queue & Processing
- Card per uploaded image showing thumbnail, filename, size, status badge, remove button
- "Compress & Convert All" primary button + "Clear All"
- Sequential processing with per-image spinner and overall progress bar

## Section 5: Results
- Before/After comparison cards showing original vs processed thumbnails, sizes, dimensions, and % reduction
- Per-image download button + format badge
- "Download All as ZIP" (using JSZip), "Process More Images" reset button
- Social share buttons (Twitter/X, WhatsApp)

## Section 6: Social Media Presets Grid
- Platform cards (Instagram, LinkedIn, WhatsApp, Twitter/X, Facebook, YouTube) with icons and recommended dimensions
- Clicking auto-fills resize settings and scrolls to upload

## Section 7: How It Works
- 3-step visual guide: Upload → Configure → Download

## Section 8: Why ImageSqueeze (Features Grid)
- 6 feature cards: Private, Fast, Batch, Social Presets, Format Conversion, Free Forever

## Section 9: Pro Tier Teaser
- Styled upsell card listing upcoming Pro features
- "Join Waitlist" button opening email input modal (UI only)

## Section 10: FAQ
- 6 accordion items covering privacy, formats, limits, WebP, batch size, no-account

## Section 11: Footer
- Logo, links (Privacy, How It Works, FAQ), "Built with ❤️ by Lade Stack" linking to ladestack.in, © 2026, social icons

---

## Technical Implementation

- **Compression**: `browser-image-compression` library with web workers for non-blocking processing
- **Resize & Convert**: Canvas API for dimension changes and format conversion
- **Download**: `file-saver` for single files, `jszip` + `file-saver` for batch ZIP download
- **Theme**: Dark mode default via CSS variables, toggle with `next-themes`, custom violet/cyan palette
- **Font**: Inter from Google Fonts
- **Design**: Glassmorphism cards, gradient accents, rounded-2xl cards, rounded-full buttons, fully responsive (320px–1920px)

