# ⚡ ImageSqueeze — Free Image Compressor, Resizer & WebP Converter

> **Compress images up to 90% online for free.** Resize for Instagram, LinkedIn, YouTube & more. Convert to WebP. 100% private — your images never leave your browser.

[![Built with React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

---

## 📸 What is ImageSqueeze?

ImageSqueeze is a **100% client-side** image compression, resizing, and format conversion tool. No server uploads, no accounts, no tracking — everything runs **instantly in your browser**.

### ✨ Key Highlights

- 🔒 **100% Private** — Images are processed entirely in-browser using Canvas API & Web Workers
- ⚡ **Instant Processing** — No upload delays, no server round-trips
- 🆓 **Free Forever** — No subscriptions, no hidden fees, no watermarks
- 📱 **Fully Responsive** — Works beautifully on desktop, tablet, and mobile
- 🌙 **Dark/Light Mode** — Theme persists across sessions via localStorage

---

## 🚀 Features

### 🗜️ Compression
- **Quality slider** (10–100%) with real-time quality indicator
- **Auto Optimize for Web** mode — locks quality at 75% for best balance
- **Target file size** — specify a max KB and let the engine find the right quality
- Uses `browser-image-compression` with **Canvas API fallback** for reliable output

### 📐 Resize
- **Custom width/height** inputs with pixel precision
- **Aspect ratio lock** — automatically recalculates dimensions
- **9 Social Media Presets** with one-click apply:
  - 📸 Instagram Post (1080×1080)
  - 📱 Instagram Story (1080×1920)
  - 💼 LinkedIn Post (1200×627) & Banner (1584×396)
  - 💬 WhatsApp DP (500×500)
  - 🐦 Twitter/X Post (1200×675)
  - 📘 Facebook Cover (820×312)
  - 📺 YouTube Thumbnail (1280×720)
  - 🖥️ Full HD (1920×1080)

### 🔄 Format Conversion
- **JPEG** — Best for photos
- **PNG** — Best for transparency
- **WebP ⭐ (Recommended)** — ~30% smaller than JPEG at same quality
- **Keep Original** — No conversion, compression only

### 📦 Batch Processing
- Upload **up to 10 images** at once
- **Drag & drop** or click to browse
- Real-time **progress bar** with "Processing X of Y" status
- Individual & **batch ZIP download** via JSZip
- Per-file **before/after comparison cards** with size reduction stats

### 🛡️ Error Handling & Warnings
- **Large files (>10MB)** — Warning toast before processing
- **GIF files** — Info toast: animated GIFs converted to static
- **Per-file error states** — Failed files show error message, remaining files continue
- **Graceful fallback** — Canvas API used when `browser-image-compression` can't handle format

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18.3 | UI components & state management |
| **Language** | TypeScript 5.x | Type safety & developer experience |
| **Build Tool** | Vite 5.x | Lightning-fast HMR & bundling |
| **Styling** | Tailwind CSS 3.x | Utility-first responsive design |
| **UI Components** | shadcn/ui | Accessible, customizable component library |
| **Compression** | browser-image-compression | Client-side image compression engine |
| **Canvas API** | Native browser | WebP/PNG conversion & precise resizing |
| **ZIP Creation** | JSZip | Client-side batch download packaging |
| **File Download** | FileSaver.js | Cross-browser file save triggers |
| **Icons** | Lucide React | Consistent, tree-shakable icon set |
| **Notifications** | Sonner | Elegant toast notifications |
| **Routing** | React Router DOM 6.x | SPA navigation |
| **Testing** | Vitest | Unit & integration testing |

---

## 📊 Performance Stats

| Metric | Value |
|--------|-------|
| **Compression ratio** | Up to **90% reduction** |
| **Max batch size** | 10 images per session |
| **Supported formats** | JPG, PNG, WebP, AVIF, GIF, BMP |
| **Output formats** | JPEG, PNG, WebP, Original |
| **Max resolution** | Limited only by browser memory |
| **Server uploads** | **Zero** — fully client-side |
| **Bundle size** | Optimized with tree-shaking & lazy loading |

---

## 🏗️ Getting Started

### Prerequisites

- **Node.js** ≥ 18.x — [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **bun** package manager

### Installation

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>

# 2. Navigate to the project directory
cd imagesqueeze

# 3. Install dependencies
npm install
# or
bun install

# 4. Start the development server
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
# Output: dist/
```

### Run Tests

```bash
npm run test
# or
npx vitest
```

---

## ⚙️ Configuration

### Theme Configuration

Themes are defined in `src/index.css` using CSS custom properties:

```css
:root {
  --primary: 263 70% 58%;     /* Violet */
  --accent: 187 92% 43%;      /* Cyan */
  --background: 210 20% 98%;  /* Light mode bg */
}

.dark {
  --background: 0 0% 5.9%;    /* Dark mode bg */
}
```

### Tailwind Configuration

Extended in `tailwind.config.ts`:
- **Custom animations**: `fade-in`, `fade-in-up`, `scale-in`, `slide-in-right`
- **Utility classes**: `.glass-card`, `.gradient-text`, `.gradient-bg`, `.hover-scale`
- **Design tokens**: All colors use HSL semantic tokens

### Settings Persistence

User settings are automatically saved to `localStorage` under key `imagesqueeze-settings`:

| Setting | Default | Range |
|---------|---------|-------|
| Quality | 75% | 10–100% |
| Auto Optimize | On | Toggle |
| Output Format | WebP | JPEG / PNG / WebP / Original |
| Lock Aspect Ratio | On | Toggle |
| Target Size (KB) | — | Optional |

### Dark Mode

- Default: **Dark mode**
- Persisted in `localStorage` under `imagesqueeze-theme`
- **No flash on reload** — inline script in `index.html` sets theme class before React hydrates

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx           # Fixed navbar with scroll shadow & theme toggle
│   ├── HeroSection.tsx      # Hero with gradient mesh background
│   ├── UploadZone.tsx       # Drag & drop upload area
│   ├── SettingsPanel.tsx    # Tabbed settings (Compress/Resize/Convert)
│   ├── ImageQueue.tsx       # File queue with status badges
│   ├── ResultsSection.tsx   # Before/after cards with animated stats
│   ├── SocialPresetsGrid.tsx# One-click social media presets
│   ├── HowItWorks.tsx       # 3-step explainer section
│   ├── FeaturesGrid.tsx     # Feature cards grid
│   ├── FAQSection.tsx       # Accordion FAQ
│   ├── ProTeaser.tsx        # Pro version teaser
│   ├── Footer.tsx           # Footer with links & attribution
│   └── ui/                  # shadcn/ui components
├── hooks/
│   ├── useImageUpload.ts    # File management, processing queue, URL cleanup
│   ├── useSettings.ts       # Settings state with localStorage persistence
│   └── use-mobile.tsx       # Mobile breakpoint detection
├── contexts/
│   └── ThemeContext.tsx      # Dark/light mode provider
├── utils/
│   └── imageProcessor.ts    # Core processing: compression, resize, Canvas API
├── pages/
│   ├── Index.tsx             # Main page
│   └── NotFound.tsx          # 404 page
└── index.css                 # Design tokens & utility classes
```

---

## ♿ Accessibility

- **WCAG AA** color contrast compliance
- `aria-label` on all icon-only buttons
- `role="button"` with keyboard support on upload zone
- `aria-pressed` / `aria-checked` on toggle & radio buttons
- Semantic `<nav>`, `<section>`, `<header>`, `<footer>` elements
- `focus-visible` ring styles for keyboard navigation
- Proper `alt` text on all images

---

## 🔒 Privacy & Security

- **Zero server uploads** — all processing happens in the browser
- **No tracking or analytics** — no cookies, no fingerprinting
- **No account required** — completely anonymous usage
- **Object URL cleanup** — all `URL.createObjectURL()` references are properly revoked on removal, clear, and component unmount to prevent memory leaks

---

## 🌐 SEO

- **Title**: `<60 chars` with primary keyword
- **Meta description**: `<160 chars` targeting search intent
- **Open Graph** & **Twitter Card** meta tags for social sharing
- **JSON-LD** structured data (WebApplication schema)
- **Canonical URL** set
- **Semantic HTML** with single `<h1>`
- **Emoji favicon** (⚡) via inline SVG

---

## 📄 License

This project is open source. Built with ❤️ by [Lade Stack](https://ladestack.in).

---

## 🙏 Credits

- [React](https://react.dev) — UI framework
- [Vite](https://vitejs.dev) — Build tool
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [shadcn/ui](https://ui.shadcn.com) — Component library
- [browser-image-compression](https://github.com/nichenqin/browser-image-compression) — Compression engine
- [Lucide](https://lucide.dev) — Icons
- [Sonner](https://sonner.emilkowal.dev) — Toast notifications
- [JSZip](https://stuk.github.io/jszip/) — ZIP file generation
- Built on [Lovable](https://lovable.dev)
