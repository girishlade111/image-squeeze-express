# ⚡ ImageSqueeze — Free Image Compressor, Resizer & WebP Converter

> **Compress images up to 90% online for free.** Resize for Instagram, LinkedIn, YouTube & more. Convert to WebP. 100% private — your images never leave your browser.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](https://choosealicense.com/licenses/mit/)
[![Platform](https://img.shields.io/badge/Platform-Web-brightgreen)](#)

---

## 📸 What is ImageSqueeze?

ImageSqueeze is a **100% client-side** image compression, resizing, and format conversion tool. No server uploads, no accounts, no tracking — everything runs **instantly in your browser** using modern web APIs.

### ✨ Key Highlights

| Feature | Description |
|---------|-------------|
| 🔒 **100% Private** | Images processed in-browser using Canvas API & Web Workers — never leave your device |
| ⚡ **Instant Processing** | No upload delays, no server round-trips — compression starts immediately |
| 🆓 **Free Forever** | No subscriptions, no hidden fees, no watermarks — ever |
| 📱 **Fully Responsive** | Works beautifully on desktop, tablet, and mobile devices |
| 🌙 **Dark/Light Mode** | Theme persists across sessions via localStorage |
| 🎯 **Smart Presets** | One-click resize for all major social media platforms |

---

## 🚀 Features

### 🗜️ Compression

- **Quality Slider** — Adjustable 10–100% with real-time quality indicator
  - 🟢 High (80–100%): Minimal compression, best quality
  - 🟡 Balanced (50–79%): Great for web & social media
  - 🔴 Aggressive (10–49%): Maximum compression for thumbnails
- **Auto Optimize for Web** — Locks quality at 75% for optimal balance
- **Target File Size** — Specify max KB, engine finds right quality automatically
- Uses `browser-image-compression` library with **Canvas API fallback** for reliability

### 📐 Resize

- **Custom Dimensions** — Width/height inputs with pixel precision
- **Aspect Ratio Lock** — Automatically recalculates when one dimension changes
- **9 Social Media Presets** — One-click apply:

| Platform | Preset | Dimensions |
|---------|-------|------------|
| 📸 | Instagram Post | 1080×1080 |
| 📱 | Instagram Story | 1080×1920 |
| 💼 | LinkedIn Post | 1200×627 |
| 💼 | LinkedIn Banner | 1584×396 |
| 💬 | WhatsApp DP | 500×500 |
| 🐦 | Twitter/X Post | 1200×675 |
| 📘 | Facebook Cover | 820×312 |
| 📺 | YouTube Thumbnail | 1280×720 |
| 🖥️ | Full HD | 1920×1080 |

### 🔄 Format Conversion

| Format | Best For | Notes |
|--------|----------|-------|
| **JPEG** | Photos, complex images | Universal compatibility |
| **PNG** | Transparency, graphics | Lossless, larger files |
| **WebP ⭐** | Web performance | ~30% smaller than JPEG |
| **Keep Original** | Compression only | No format change |

> 💡 **Pro Tip**: WebP is recommended — same quality, 30% smaller file size, better Core Web Vitals.

### 📦 Batch Processing

- **Batch Upload** — Up to 10 images simultaneously
- **Drag & Drop** — Or click to browse files
- **Progress Tracking** — Real-time progress bar with status
- **Individual Download** — Download single processed images
- **Batch ZIP Download** — Download all as ZIP via JSZip
- **Before/After Cards** — Visual comparison with size reduction stats

### 🛡️ Error Handling

- **Large File Warning** — Toast warning for files >10MB before processing
- **GIF Info** — Notifies user that animated GIFs become static
- **Per-File Errors** — Failed files show error message, processing continues
- **Graceful Fallback** — Canvas API used when compression library can't handle format

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.x | UI framework & state management |
| **TypeScript** | 5.x | Type safety & developer experience |
| **Vite** | 5.x | Lightning-fast HMR & bundling |
| **Tailwind CSS** | 3.x | Utility-first responsive styling |
| **shadcn/ui** | Latest | Accessible component library |

### Libraries & Dependencies

| Package | Purpose |
|---------|---------|
| `browser-image-compression` | Client-side image compression |
| `jszip` | ZIP file generation for batch download |
| `file-saver` | Cross-browser file save triggers |
| `lucide-react` | Tree-shakable icons |
| `sonner` | Elegant toast notifications |
| `react-router-dom` | SPA navigation |
| `@radix-ui/*` | Accessible UI primitives |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting & quality |
| **Vitest** | Unit & integration testing |
| **PostCSS** | CSS processing |
| **Autoprefixer** | Vendor prefix automation |

---

## 📊 Performance Stats

| Metric | Value |
|--------|-------|
| **Compression Ratio** | Up to **90%** file size reduction |
| **Max Batch Size** | 10 images per session |
| **Supported Input** | JPG, PNG, WebP, AVIF, GIF, BMP |
| **Output Formats** | JPEG, PNG, WebP, Original |
| **Max Resolution** | Browser memory limited |
| **Server Uploads** | **Zero** — fully client-side |
| **Bundle Size** | Optimized with tree-shaking |
| **Lazy Loading** | Code-split by route & component |

---

## 🏗️ Getting Started

### Prerequisites

- **Node.js** ≥ 18.x — [Install via nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **bun** package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/girishlade111/image-squeeze-express.git

# Navigate to project directory
cd image-squeeze-express

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

> 🌐 **App URL**: `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Output directory: dist/
```

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
# Run tests once
npm run test

# Watch mode
npm run test:watch
```

### Lint Code

```bash
npm run lint
```

---

## ⚙️ Configuration

### Theme Colors

Customize in `src/index.css`:

```css
:root {
  /* Primary: Violet */
  --primary: 263 70% 58%;
  
  /* Accent: Cyan */
  --accent: 187 92% 43%;
  
  /* Light mode background */
  --background: 210 20% 98%;
  --foreground: 240 10% 10%;
  
  /* Success green */
  --success: 142 71% 45%;
}

.dark {
  /* Dark mode background */
  --background: 0 0% 5.9%;
  --foreground: 0 0% 95%;
}
```

### Tailwind Extensions

Extended in `tailwind.config.ts`:

```typescript
// Custom animations
animations: {
  fadeIn,
  fadeInUp,
  scaleIn,
  slideInRight,
  float,
  shimmer,
}

// Custom utilities
utilities: {
  glass-card,
  gradient-text,
  gradient-bg,
  gradient-border,
  glass-morphism,
}
```

### Settings Storage

User settings saved to `localStorage`:

| Key | Setting | Default | Type |
|-----|---------|---------|------|
| `imagesqueeze-settings` | All preferences | See below | JSON |
| `imagesqueeze-theme` | Dark/Light mode | `dark` | string |

### Default Settings

| Setting | Default | Range |
|---------|---------|-------|
| Quality | `75` | 10–100 |
| Auto Optimize | `true` | boolean |
| Output Format | `webp` | jpeg/png/webp/original |
| Lock Aspect Ratio | `true` | boolean |
| Target Size (KB) | `null` | number/null |
| Width | `null` | number/null |
| Height | `null` | number/null |

### Dark Mode

- **Default**: Dark mode
- **Persistence**: localStorage key `imagesqueeze-theme`
- **No Flash**: Inline script in `index.html` prevents flash on reload

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx              # Fixed nav with scroll shadow & theme toggle
│   ├── HeroSection.tsx         # Hero with animated gradient background
│   ├── UploadZone.tsx         # Drag & drop upload area
│   ├── SettingsPanel.tsx      # Tabbed settings (Compress/Resize/Convert)
│   ├── ImageQueue.tsx         # File queue with status badges
│   ├── ResultsSection.tsx     # Before/after cards with stats
│   ├── SocialPresetsGrid.tsx  # One-click social presets
│   ├── HowItWorks.tsx        # 3-step explainer
│   ├── FeaturesGrid.tsx       # Feature cards grid
│   ├── FAQSection.tsx         # Accordion FAQ
│   ├── ProTeaser.tsx         # Pro version teaser
│   ├── Footer.tsx            # Links & attribution
│   └── ui/                 # shadcn/ui components
├── hooks/
│   ├── useImageUpload.ts     # File management & processing
│   ├── useSettings.ts      # Settings with persistence
│   └── use-mobile.tsx    # Mobile detection
├── contexts/
│   └── ThemeContext.tsx    # Dark/light mode
├── utils/
│   └── imageProcessor.ts   # Core compression logic
├── pages/
│   ├── Index.tsx          # Main page
│   └── NotFound.tsx       # 404 page
├── App.tsx               # App router
├── main.tsx              # Entry point
└── index.css            # Styles & tokens
```

---

## ♿ Accessibility

- ✅ **WCAG AA** color contrast compliance
- ✅ `aria-label` on all icon-only buttons
- ✅ `role="button"` with keyboard support
- ✅ `aria-pressed` / `aria-checked` on toggles
- ✅ Semantic HTML (`nav`, `section`, `header`, `footer`)
- ✅ `focus-visible` ring styles
- ✅ Proper `alt` text on images

---

## 🔒 Privacy & Security

- ✅ **Zero server uploads** — All processing in-browser
- ✅ **No tracking** — No cookies, no analytics
- ✅ **No account required** — Anonymous usage
- ✅ **Memory cleanup** — Object URLs revoked on unmount

---

## 🌐 SEO Optimization

- ✅ Single `<h1>` with primary keyword
- ✅ Meta description <160 chars
- ✅ Open Graph & Twitter Cards
- ✅ JSON-LD structured data
- ✅ Canonical URL
- ✅ Semantic HTML

---

## 📄 License

MIT License — Built with ❤️ by [Lade Stack](https://ladestack.in)

---

## 🙏 Credits & Thanks

- [React](https://react.dev) — UI framework
- [Vite](https://vitejs.dev) — Build tool
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [shadcn/ui](https://ui.shadcn.com) — Components
- [browser-image-compression](https://github.com/nichenqin/browser-image-compression) — Engine
- [Lucide](https://lucide.dev) — Icons
- [Sonner](https://sonner.emilkowal.dev) — Toasts
- [JSZip](https://stuk.github.io/jszip/) — ZIP generation
- [Lovable](https://lovable.dev) — Platform

---

## 📈 Stats

```
┌─────────────────────────────────────┐
│  Images Processed    │     0         │
│  Total Reduced     │     0 KB       │
│  Avg Reduction    │      0%        │
└─────────────────────────────────────┘
      ↑ Updates when you compress ↑
```

---

**Last Updated**: April 2026
**Version**: 1.0.0
**Maintainer**: [@girishlade111](https://github.com/girishlade111)