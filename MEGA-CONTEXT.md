# LS Image Compressor — Mega Full App Context (for AI-Assisted Improvements)

> **Purpose:** Ultra-detailed, complete source-of-truth context dump for any AI assistant (or developer) that needs to make changes, add features, fix bugs, or refactor the **LS Image Compressor** project. This file contains **actual code** from every critical file in the codebase, so the AI does NOT need to read the original files unless doing detailed editing.
>
> **Project Name:** `ls-image-compressor` (in `package.json`), branded as **LS Image Compressor**.
>
> **Domain:** `https://img.ladestack.in`
>
> **Author / Owner:** Lade Stack (Girish Lade) — `https://ladestack.in`
>
> **Last Updated:** June 8, 2026

---

## Table of Contents
1. [High-Level Snapshot](#1-high-level-snapshot)
2. [Tech Stack & Tooling](#2-tech-stack--tooling)
3. [Complete Directory Map with File Sizes](#3-complete-directory-map)
4. [Config Files (Actual Code)](#4-config-files-actual-code)
5. [App Bootstrap & Routing (Actual Code)](#5-app-bootstrap--routing-actual-code)
6. [The Image Compressor Engine](#6-the-image-compressor-engine)
7. [The PDF Compressor Engine](#7-the-pdf-compressor-engine)
8. [The Bulk Renamer Engine](#8-the-bulk-renamer-engine)
9. [Hooks (State Machines) — Actual Code](#9-hooks-state-machines)
10. [Components — Complete Reference](#10-components)
11. [Pages — Complete Reference](#11-pages)
12. [SEO & Theme System](#12-seo--theme-system)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)
14. [Testing](#14-testing)
15. [Known Tech Debt & Improvement Targets](#15-known-tech-debt)

---

## 1. High-Level Snapshot

LS Image Compressor is a **100% client-side, privacy-first** web app built with **Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui**. It provides three independent tools (all running entirely in the browser — **no server, no uploads, no auth**):

| Tool | Route | Purpose | Tech used |
|---|---|---|---|
| **Image Compressor / Resizer / Converter** | `/` | Compress up to 50 images at a time (750 MB total, 25 MB each), resize with social-media presets, convert to WebP/AVIF/JPEG/PNG, rotate, mirror, grayscale, strip EXIF, target a specific KB size | `browser-image-compression` (Web Worker fast path), HTML5 Canvas, `URL.createObjectURL` |
| **PDF Compressor** | `/compress-pdf` | Compress up to 5 PDFs (each up to 100 MB) by re-rendering every page as a JPEG and rebuilding the PDF. Includes DPI override, target-size iteration, grayscale, metadata strip, page-range selection, filename tokens, smart recommendation | `pdfjs-dist` (parsing + rasterizing), `pdf-lib` (rebuilding) |
| **Bulk File Renamer** | `/bulk-rename` | Add up to 100 files, build a stack of 13 different rename rules, see a live preview, download everything as a ZIP | `JSZip`, `file-saver` |

The marketing site also has:
- `/about` — mission, vision, story, stats, philosophy, journey, values, tech stack
- `/contact` — contact cards, social links, FAQ-style contact info
- `/privacy` — privacy policy (updated March 8, 2026)
- `/terms` — terms of service (updated March 8, 2026)
- `*` (NotFound) — 404 page with `ErrorBoundary` fallback

**Brand identity:** Monochrome — `--primary: 0 0% 0%` (pure black), `--accent: 0 0% 9%` (near-black), with signature `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))` gradient. Dark mode is **default**. Font: **Inter**. Logo: ⚡ emoji.

**Deploy target:** Vercel (SPA rewrites, 1y immutable cache for hashed assets, security headers).

---

## 2. Tech Stack & Tooling

### 2.1 package.json — Complete Dependencies

```json
{
  "name": "ls-image-compressor",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "og:gen": "node scripts/generate-og-images.mjs",
    "og:optimize": "node scripts/optimize-profile.mjs"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@phosphor-icons/react": "^2.1.7",
    "@radix-ui/react-accordion": "^1.2.1",
    "@radix-ui/react-alert-dialog": "^1.1.2",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-collapsible": "^1.1.1",
    "@radix-ui/react-context-menu": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^1.1.2",
    "@radix-ui/react-hover-card": "^1.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.2",
    "@radix-ui/react-navigation-menu": "^1.2.1",
    "@radix-ui/react-popover": "^1.1.2",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.1",
    "@radix-ui/react-scroll-area": "^1.2.1",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.1",
    "@radix-ui/react-sonner": "^1.7.4",
    "@radix-ui/react-switch": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.3",
    "@tanstack/react-query": "^5.83.0",
    "browser-image-compression": "^2.0.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "file-saver": "^2.0.5",
    "framer-motion": "^12.38.0",
    "input-otp": "^1.4.2",
    "jszip": "^3.10.1",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "pdf-lib": "^1.17.1",
    "pdfjs-dist": "^6.0.227",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-resizable-panels": "^2.1.9",
    "react-router-dom": "^6.30.1",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.0.0",
    "@types/file-saver": "^2.0.7",
    "@types/node": "^22.15.17",
    "@types/react": "^18.3.20",
    "@types/react-dom": "^18.3.6",
    "@vercel/analytics": "^1.5.0",
    "@vercel/speed-insights": "^1.2.0",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.32.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "jsdom": "^20.0.3",
    "lovable-tagger": "^1.1.13",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.24.0",
    "vite": "^5.4.19",
    "vitest": "^3.2.4"
  }
}
```

### 2.2 NPM Scripts Reference

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Dev server on `0.0.0.0:8080` |
| `build` | `vite build` | Production build → `dist/` |
| `build:dev` | `vite build --mode development` | Dev build |
| `lint` | `eslint .` | Lint all files |
| `preview` | `vite preview` | Preview production build |
| `test` | `vitest run` | Run tests once |
| `test:watch` | `vitest` | Watch mode tests |
| `og:gen` | `node scripts/generate-og-images.mjs` | Regenerate 6 OG images |
| `og:optimize` | `node scripts/optimize-profile.mjs` | Re-encode profile to AVIF/WebP |

### 2.3 vite.config.ts — Actual Code

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-pdf": ["pdfjs-dist", "pdf-lib"],
          "vendor-zip": ["jszip", "file-saver"],
          "vendor-image": ["browser-image-compression"],
          "vendor-motion": ["framer-motion"],
        },
      },
    },
  },
}));
```

### 2.4 tailwind.config.ts — Actual Code

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary)/0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary)/0.5)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### 2.5 vitest.config.ts — Actual Code

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 2.6 Config Files — Quick Reference

**tsconfig.json (root):**
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

**tsconfig.app.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals"],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

**tsconfig.node.json:** Strict mode for `vite.config.ts`.

**eslint.config.js:** Flat config — browser globals, `react-hooks` + `react-refresh`, `@typescript-eslint/no-unused-vars: off`.

**postcss.config.js:** `tailwindcss` + `autoprefixer`.

**components.json** (shadcn/ui): `style: default`, `RSC: false`, `baseColor: slate`, `cssVariables: true`.

---

## 3. Complete Directory Map

```
image-squeeze-express/
├── index.html                          # 990 lines — SEO + theme bootstrap + JSON-LD + root mount
├── package.json                        # Full dep list
├── vite.config.ts                      # @ alias, port 8080, manualChunks, lovable-tagger
├── vitest.config.ts                    # jsdom + @ alias + setupFiles
├── tailwind.config.ts                  # Custom CSS-var colors, animations
├── tsconfig.json / .app.json / .node.json
├── eslint.config.js                    # Flat config, lenient
├── postcss.config.js
├── components.json                     # shadcn/ui config
├── vercel.json                         # SPA rewrites + cache + security headers
├── bun.lock / bun.lockb / package-lock.json
│
├── public/
│   ├── favicon.svg                     # ⚡ emoji logo (inline SVG data-URI also in index.html)
│   ├── favicon-16x16.png / favicon-32x32.png / apple-touch-icon.png / apple-touch-icon.svg
│   ├── logo-mark.svg                   # Just the ⚡ mark
│   ├── placeholder.svg
│   ├── pdf.worker.min.mjs              # pdfjs worker (1.2 MB)
│   ├── robots.txt                      # 693 lines — extensive bot directives
│   ├── sitemap.xml                     # 8 URLs with images
│   ├── sitemap-index.xml               # Indexes 3 sitemaps
│   ├── image-sitemap.xml               # 9 images (OG + profile photos)
│   ├── og-image.png/svg                # Default OG (home)
│   ├── og-pdf.png/svg / og-rename.png/svg / og-about.png/svg
│   ├── og-contact.png/svg / og-privacy.png/svg / og-terms.png/svg
│
├── scripts/
│   ├── generate-og-images.mjs          # satori + sharp — generates 7 OG PNG+SVG pairs
│   └── optimize-profile.mjs            # sharp — re-encodes profile to WebP/AVIF @1x and @2x
│
├── src/
│   ├── main.tsx                        # 5 lines — createRoot
│   ├── App.tsx                         # 99 lines — providers + routes + ErrorBoundary
│   ├── VercelAnalytics.tsx             # Idle-loaded analytics + speed-insights
│   ├── index.css                       # 500+ lines — Tailwind + theme CSS vars + custom utilities
│   ├── vite-env.d.ts
│   │
│   ├── assets/
│   │   ├── profile.webp / profile@2x.webp
│   │   ├── profile.avif / profile@2x.avif
│   │
│   ├── contexts/
│   │   └── ThemeContext.tsx            # Dark/light toggle + localStorage persistence
│   │
│   ├── config/
│   │   └── seo.ts                      # Per-page SEO registry (8 pages)
│   │
│   ├── lib/
│   │   ├── utils.ts                    # cn() helper
│   │   ├── motion.ts                   # Shared framer-motion variants
│   │   └── prefetch.ts                 # usePrefetchOnHover + prefetchOnIdle
│   │
│   ├── hooks/                          # 8 custom hooks
│   │   ├── useImageUpload.ts           # Image batch state machine (main one)
│   │   ├── usePdfUpload.ts             # PDF batch state machine
│   │   ├── useFileRename.ts            # Renamer batch state machine + ZIP
│   │   ├── useSettings.ts              # Persistent compression settings
│   │   ├── imageUploadLimits.ts        # Constants re-export
│   │   ├── useClipboardPaste.ts        # Document-level paste listener
│   │   ├── usePageDropZone.ts          # Document-level drag/drop tracker
│   │   ├── use-toast.ts                # Radix toast reducer
│   │   └── use-mobile.tsx              # < 768px detection
│   │
│   ├── components/
│   │   ├── ui/                         # 49 shadcn/ui primitives
│   │   ├── Header.tsx                  # Fixed top nav, mobile drawer, theme toggle
│   │   ├── Footer.tsx                  # 4-column footer + socials
│   │   ├── HeroSection.tsx            # Thin wrapper around ToolHero
│   │   ├── ToolHero.tsx               # Shared hero (gradient mesh + floating blobs)
│   │   ├── TrustBar.tsx               # 6-tile trust strip
│   │   ├── UploadZone.tsx             # Image drop zone
│   │   ├── ImageQueue.tsx             # Image file grid + per-file card
│   │   ├── SettingsPanel.tsx          # Tabbed Quality/Resize/Format/Output
│   │   ├── ResultsSection.tsx         # After-compress summary + ZIP + share
│   │   ├── ImageInspector.tsx         # Detailed image preview dialog
│   │   ├── ComparisonView.tsx         # Side/Slider/Toggle before-after (649 lines)
│   │   ├── EmptyState.tsx             # Centered empty-state
│   │   ├── ErrorBoundary.tsx          # Route-level error boundary
│   │   ├── MobileActionBar.tsx        # Sticky mobile CTA bar
│   │   ├── PageDropOverlay.tsx        # Full-page drop overlay
│   │   ├── LazySection.tsx            # IntersectionObserver-gated mount
│   │   ├── NavLink.tsx                # React-router NavLink wrapper (unused)
│   │   ├── ProfileImage.tsx           # <picture> wrapper
│   │   ├── ScrollToTop.tsx            # Back-to-top button
│   │   ├── Skeleton.tsx               # RouteSkeleton / BlockSkeleton / etc.
│   │   ├── HowItWorks.tsx             # 3-step section
│   │   ├── FeaturesGrid.tsx           # 6-tile bento grid
│   │   ├── FAQSection.tsx             # 12 Q&A accordion
│   │   ├── DocumentTitle.tsx          # Per-route <title>/meta/JSON-LD injector
│   │   ├── PdfUploadZone.tsx          # PDF drop zone
│   │   ├── PdfQueue.tsx               # PDF file list
│   │   ├── PdfSettingsPanel.tsx       # PDF presets + slider
│   │   ├── PdfResultsSection.tsx      # PDF results + ZIP + confetti
│   │   ├── PdfInspector.tsx           # PDF preview dialog
│   │   ├── FileRenameUploadZone.tsx   # Any-file drop zone
│   │   ├── FileRenameRuleBuilder.tsx  # 13 rule kinds (845 lines)
│   │   └── FileRenamePreviewList.tsx  # Live rename preview
│   │
│   ├── pages/
│   │   ├── Index.tsx                  # Home (image tool)
│   │   ├── CompressPdf.tsx            # PDF tool
│   │   ├── BulkRename.tsx             # Renamer tool
│   │   ├── About.tsx                  # 1701 lines, 70 KB
│   │   ├── Contact.tsx                # 913 lines, 35 KB
│   │   ├── PrivacyPolicy.tsx          # 131 lines
│   │   ├── TermsOfService.tsx         # 115 lines
│   │   └── NotFound.tsx               # 110 lines — 404
│   │
│   ├── utils/                         # Pure logic engines
│   │   ├── imageProcessor.ts          # 796 lines — canvas pipeline + filename tokens
│   │   ├── pdfProcessor.ts            # 525 lines — pdfjs → JPEGs → pdf-lib
│   │   ├── pdfFormat.ts               # 94 lines — PDF quality presets
│   │   ├── fileRenamer.ts             # 509 lines — 13-rule rename engine
│   │   └── batchValidation.ts         # 100 lines — batch validation
│   │
│   └── test/
│       ├── setup.ts                   # matchMedia polyfill + jest-dom
│       └── batchValidation.test.ts    # 12 unit tests
```

---

## 4. Config Files (Actual Code)

### 4.1 index.html — Full Code (990 lines)

The `index.html` is extremely SEO-heavy. It contains:
- **Inline theme bootstrap script** (lines 4-15) — reads `localStorage['ls-image-compressor-theme']` before React mounts to prevent FOUC
- **Standard meta tags**: charset, viewport, theme-color, mobile optimization
- **Extensive SEO meta** (lines 33-85): description, keywords, subject, abstract, topic, summary, category, coverage, distribution, rating, revisit-after, copyright, owner, url, author, designer, developer, geo tags (India), language, DC metadata
- **Alternate hreflang** for en, en-US, en-GB, en-IN, x-default
- **DNS prefetch & preconnect**: Google Fonts, Lovable, img.ladestack.in
- **Preload**: Inter font stylesheet, OG image for LCP
- **Favicons**: SVG, PNG 16/32, apple-touch-icon, mask-icon, msapplication-TileImage
- **Open Graph / Facebook** (lines 140-168): type, url, title, description, image (with width/height/type/alt), site_name, locale, alternate locales, determiner, rich_attachment, ttl, updated_time
- **Twitter/X Cards** (lines 173-209): summary_large_image, url, title, description, image, site, creator, label/data pairs (Privacy, Price, Formats, Batch Size), app names
- **Pinterest**: rich-pin enabled
- **Search Console**: placeholder tokens for Google, Bing, Yandex, Pinterest, Facebook, Norton, Baidu, Naver
- **App Links**: iOS/Android deep linking placeholders
- **Article tags**: publisher, author, section, tags (Image Compression, WebP, AVIF, PDF, Privacy, etc.), published/modified/expiration time
- **Book/Music/Video/Profile tags**: for knowledge panels
- **OG see-also**: cross-links to all tool pages
- **Dublin Core**: comprehensive (title, creator, contributor, publisher, subject, description, type, format, identifier, source, relation, coverage, rights, date, language, audience)
- **Robots directives**: index, follow, max-image-preview:large for googlebot, bingbot, slurp, duckduckbot, baiduspider, yandexbot
- **JSON-LD Structured Data** (lines 385-983):
  - **WebSite** with SearchAction
  - **WebApplication** — MultimediaApplication, free, 4.8 rating, feature list
  - **ItemList** — 3 tools with positions and URLs
  - **FAQPage** — 10 Q&A entries (data safety, formats, PDF compression, batch limits, WebP vs JPEG, account, mobile, presets, EXIF, file size)
  - **Organization** — Lade Stack, founder Girish Lade, contact points, sameAs links
  - **Person** — Girish Lade founder profile
  - **SoftwareApplication** — detailed with OS/browser requirements, memory/storage, rating
  - **HowTo** × 3 — "How to compress an image", "How to compress a PDF", "How to bulk rename files"
  - **Service** — OfferCatalog with 5 services
  - **BreadcrumbList** — 5 items

### 4.2 src/main.tsx — Actual Code

```tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### 4.3 src/index.css — Theme Variables & Utilities

**CSS Variables (monochrome theme):**
- `:root`: background=white, foreground=near-black, primary=near-black, accent=darker, border=light gray
- `.dark`: background=#0f0f0f, foreground=#f5f5f5, primary=#f5f5f5, accent=#e0e0e0, border=#242424
- Legacy aliases all remapped to greyscale: `--indigo`, `--teal`, `--violet`, `--cyan`, `--brand`, `--brand-2`, `--slate`

**Custom Utility Classes:**
- `.glass-card` — `backdrop-blur-xl bg-background/80 border border-border/50 shadow-elev-2`
- `.gradient-text` — `bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent`
- `.gradient-bg` — `bg-gradient-to-r from-primary to-accent`
- `.gradient-border` — `relative` with `::before` pseudo-element gradient border
- `.animate-float` — floating animation for hero blobs
- `.animate-scale-in` — scale from 0.95
- `.animate-fade-in-up` — opacity + translateY
- `.animate-pulse-glow` — box-shadow pulse
- `.shimmer-gradient`, `.animate-shimmer` — progress bar shimmer
- `.glass-morphism` — frosted glass with dark/light variants
- `.safe-bottom` — `padding-bottom: env(safe-area-inset-bottom)`
- `.shadow-elev-1/2/3` — elevation shadows

---

## 5. App Bootstrap & Routing (Actual Code)

### 5.1 src/App.tsx — Full Code (99 lines)

```tsx
import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import { RouteSkeleton } from "@/components/Skeleton";
import { prefetchOnIdle } from "@/lib/prefetch";

type VercelModule = typeof import('./VercelAnalytics');

const VercelAnalyticsLazy = () => {
  const [Mod, setMod] = useState<VercelModule | null>(null);
  useEffect(() => {
    const load = () => {
      void import('./VercelAnalytics').then((m) => setMod(m));
    };
    if (typeof window === 'undefined') return;
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(load);
    } else {
      const t = window.setTimeout(load, 1500);
      return () => window.clearTimeout(t);
    }
  }, []);
  if (!Mod) return null;
  return (
    <>
      <Mod.Analytics />
      <Mod.SpeedInsights />
    </>
  );
};

const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CompressPdf = lazy(() => import("./pages/CompressPdf"));
const BulkRename = lazy(() => import("./pages/BulkRename"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const loadAbout = () => import("./pages/About");
const loadCompressPdf = () => import("./pages/CompressPdf");
const loadBulkRename = () => import("./pages/BulkRename");
const loadContact = () => import("./pages/Contact");
const loadPrivacy = () => import("./pages/PrivacyPolicy");
const loadTerms = () => import("./pages/TermsOfService");

const App = () => {
  useEffect(() => {
    prefetchOnIdle([
      loadCompressPdf,
      loadBulkRename,
      loadAbout,
      loadContact,
      loadPrivacy,
      loadTerms,
    ]);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<RouteSkeleton />}>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/compress-pdf" element={<CompressPdf />} />
                  <Route path="/bulk-rename" element={<BulkRename />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </Suspense>
            <VercelAnalyticsLazy />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
```

**Provider Stack (top to bottom):**
1. `QueryClientProvider` (TanStack React Query — mounted but unused)
2. `ThemeProvider` (dark/light mode)
3. `TooltipProvider` (Radix)
4. `<Toaster />` (legacy Radix toast) + `<Sonner />` (actual toast system)
5. `<BrowserRouter>` with:
   - `<Suspense fallback={<RouteSkeleton />}>` — pulsing skeleton for lazy routes
   - `<ErrorBoundary>` — catches chunk-load errors + render errors
   - `<Routes>` with 8 routes (Index is the only eager one)
   - `<VercelAnalyticsLazy />` — idle-loaded analytics

**Key notes:**
- `Index` (home page / image tool) is eagerly imported — every other page is `React.lazy`
- `useEffect` in App pre-fetches all lazy chunks on idle so navigation is instant
- ErrorBoundary detects `ChunkLoadError` (stale deployment caches) and shows "New version available — Reload"
- `@tanstack/react-query` is installed and `QueryClientProvider` is mounted but **no queries are used** anywhere

### 5.2 src/VercelAnalytics.tsx — Actual Code

```tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

export { Analytics, SpeedInsights };
```

### 5.3 ThemeContext.tsx — Actual Code

```tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const THEME_KEY = "ls-image-compressor-theme";

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: true,
  toggleDarkMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return stored ? stored === "dark" : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
    } catch {}
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 5.4 lib/utils.ts — cn() helper

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 5.5 lib/motion.ts — Shared Motion Variants

Exports: `easeOutExpo`, `easeOut`, `fadeInUp`, `fadeIn`, `scaleIn`, `staggerContainer`, `floatBlob` (for hero floating shapes), `accordionVariants`, `pulseGlow`, `shimmer`, `gradientPan`, `cardHover`, `cardTap`, `buttonHover`, `buttonTap`, `iconHover`, `arrowHover`.

### 5.6 lib/prefetch.ts

```tsx
import { useCallback } from "react";

export function prefetchOnIdle(loaders: (() => Promise<unknown>) | (() => Promise<unknown>)[], timeout = 1500) {
  const list = Array.isArray(loaders) ? loaders : [loaders];
  const cb = () => { for (const l of list) l(); };
  if (typeof window === "undefined") return;
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(cb, { timeout });
  } else {
    setTimeout(cb, timeout);
  }
}

export function usePrefetchOnHover(href: string) {
  const prefetchedRef = { current: false };
  const handler = useCallback(() => {
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;
    import(/* @vite-ignore */ href);
  }, [href]);

  return {
    onMouseEnter: handler,
    onFocus: handler,
    onTouchStart: handler,
  };
}
```

---

## 6. The Image Compressor Engine

### 6.1 utils/imageProcessor.ts — Full Code (796 lines)

**Exports:**
```
Types: ImageFormat, QualityPreset, Rotation, ProcessSettings, ProcessResult, FilenameToken, FilenameTokenDocs
Functions: formatFileSize, getCompressionRatio, getImageDimensions, toMime, toExt, isFormatSupported, calcDimensions, processImage, toDownloadFile, calculateOptimalQuality, estimateQualityForSize, getExifOrientation, getFilenameTokenDocs, applyFilenameTokens
```

**ProcessSettings interface:**
```ts
interface ProcessSettings {
  quality: number;           // 10..100
  autoOptimize: boolean;
  targetSizeKB: number | null;
  width: number | null;
  height: number | null;
  lockAspectRatio: boolean;
  selectedPreset: string | null;
  outputFormat: 'jpeg' | 'png' | 'webp' | 'avif' | 'original';
  stripEXIF: boolean;
  grayscale: boolean;
  rotation: 0 | 90 | 180 | 270;
  mirror: boolean;
  filenamePattern: string;   // e.g. '{name}_q{q}.{ext}'
  qualityPreset: 'max' | 'high' | 'balanced' | 'compact' | 'custom';
}
```

**processImage() algorithm:**
1. Resolve output MIME via `toMime(settings.outputFormat, file.type)`
2. Read original dimensions via `getImageDimensions(file)` — creates temp Image, reads naturalWidth/Height
3. Compute target dimensions via `calcDimensions(origW, origH, w, h, lock)` — includes social media preset logic
4. Check if canvas path is needed: `hasTransforms = rotation || mirror || grayscale || stripEXIF`, `needsResize`, `needsFormatChange`
5. Compute quality: autoOptimize → `calculateOptimalQuality()`, else `settings.quality`
6. **Canvas path** (any transform/resize/format change): `canvasProcess()` with offscreen canvas
7. **Fast path** (no changes): delegate to `browser-image-compression` with `useWebWorker: true`
8. **Target size loop**: if `targetSizeKB` set, iteratively reduce quality (max 5 iters, decrement by 10)

**canvasProcess() algorithm:**
1. `loadImage(source)` → returns HTML Image element
2. Create offscreen canvas; for 90°/270° rotation, swap w/h
3. `ctx.imageSmoothingEnabled = true`, quality = 'high'
4. If JPEG output, fill white first (prevents transparency artifacts)
5. Handle crop rectangle if present
6. For rotation/mirror: translate to center → `ctx.scale(-1,1)` for mirror → `ctx.rotate(deg * PI / 180)`
7. Grayscale: BT.601 luma transform pixel-by-pixel on ImageData
8. `canvas.toBlob(callback, mime, quality/100)`

**calcDimensions()** — social-media-preset-aware math:
- 9 presets: IG Post (1080×1080), IG Story (1080×1920), LinkedIn (1200×627), LI Banner (1584×396), WhatsApp (500×500), Twitter (1200×675), FB Cover (820×312), YT Thumb (1280×720), Full HD (1920×1080)
- Returns `{ w, h, crop? }` — center-crops when aspect ratio doesn't match

**isFormatSupported(mime)** — feature-detects via `canvas.toDataURL(mime)`, cached in `Map<string, boolean>`, returns false if no `document` (SSR/test).

**Filename tokens:**
| Token | Value |
|---|---|
| `{name}` | Original base name without extension |
| `{ext}` | Original extension or new output extension |
| `{format}` | Output format lowercase (webp, avif, jpeg, png) |
| `{w}` / `{h}` | Output width / height in pixels |
| `{q}` | Quality percentage |
| `{index}` | File index (1-based batch) |
| `{date}` | Today's date as YYYY-MM-DD |
| `{size}` | Output size in KB |

**getExifOrientation()** — currently returns `1` (stub — EXIF orientation is not honored). 

**calculateOptimalQuality():**
- Target KB set → ratio-based: ≥0.9→95, ≥0.7→82, ≥0.5→68, ≥0.3→50, else 35
- WebP → 80 (with transforms) / 75 (without)
- AVIF → 70 (with transforms) / 65 (without)
- PNG → 100 (lossless)
- Else → 80

### 6.2 useSettings hook — Actual Code

```tsx
interface Settings {
  quality: number;
  autoOptimize: boolean;
  targetSizeKB: number | null;
  width: number | null;
  height: number | null;
  lockAspectRatio: boolean;
  selectedPreset: string | null;
  outputFormat: 'jpeg' | 'png' | 'webp' | 'avif' | 'original';
  stripEXIF: boolean;
  grayscale: boolean;
  rotation: 0 | 90 | 180 | 270;
  mirror: boolean;
  filenamePattern: string;
  qualityPreset: 'max' | 'high' | 'balanced' | 'compact' | 'custom';
}

const DEFAULT_SETTINGS: Settings = {
  quality: 75,
  autoOptimize: true,
  targetSizeKB: null,
  width: null,
  height: null,
  lockAspectRatio: true,
  selectedPreset: null,
  outputFormat: 'webp',
  stripEXIF: true,
  grayscale: false,
  rotation: 0,
  mirror: false,
  filenamePattern: '{name}_q{q}.{format}',
  qualityPreset: 'balanced',
};
```

Persisted to `localStorage['ls-image-compressor-settings']`. Methods:
- `update(partial)` — merges partial
- `resetResize()` — clears width/height/selectedPreset/rotation/mirror
- `applyQualityPreset(preset)` — maps preset strings to quality values
- `rotateImage(deg)` / `flipImage()` — single-field updates
- `resetAll()` — restores defaults
- `setWidth(value, sourceDims?)` / `setHeight(value, sourceDims?)` — `computeAspectDimensions()` for aspect-ratio locking

### 6.3 useImageUpload hook — State Machine

**State:**
```ts
files: UploadedFile[]       // the queue
isProcessing: boolean
progress: number            // 0..100
processingText: string      // "Processing 3 of 10 — file.jpg"
currentItem: string | null  // id of current file
stats: ProcessingStats      // { bytesPerSecond, etaMs, startedAt, completedBytes }
```

**UploadedFile interface:**
```ts
{
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;       // resolved async via getImageDimensions
  originalHeight: number;
  preview: string;             // ObjectURL for original
  status: 'ready' | 'processing' | 'done' | 'error';
  error?: string;
  result?: ProcessResult;
  processedFile?: File;
  processedPreview?: string;   // ObjectURL for result
}
```

**ProcessingStats:**
```ts
{ bytesPerSecond: number; etaMs: number | null; startedAt: number; completedBytes: number }
```

**Limits:**
- `MAX_FILES = 50`
- `MAX_FILE_SIZE = 25 MB`
- `MAX_TOTAL_BATCH_SIZE = 750 MB`
- `LARGE_FILE_THRESHOLD = 10 MB`

**Validation flow (addFiles):**
1. Filter to `image/*` types
2. `validateBatch(files, currentCount)` → `ValidationReport` with `accepted`, `overflow`, `oversized`, `acceptedBytes`, `exceedsTotalCap`, `largeFileCount`, `animatedGifCount`
3. For each accepted: generate UUID, `URL.createObjectURL` for preview, track in `urlsRef`
4. Resolve dimensions async (best-effort)
5. Emit toast summary (overflow/oversized/largeFile/animatedGif)

**Object URL lifecycle:** `urlsRef = useRef<Set<string>>(new Set())` — all URLs revoked on unmount.

**processFiles flow:**
1. Snapshot targets via `setFiles` trick
2. `await Promise.resolve()` to yield to React
3. Mark all targets as `processing`
4. For each target sequentially:
   - Update `currentItem` + `processingText`
   - `processImage(item.file, settings, item.originalSize)`
   - Success: store result, `toDownloadFile()`, `URL.createObjectURL(blob)`, increment stats
   - Error: store error message
   - Update progress + ETA
5. Single summary toast at end

**Derived state:** `hasFiles`, `allDone`, `processedFiles`, `hasErrors`, `readyCount`.

### 6.4 Batch Validation

```ts
// utils/batchValidation.ts
export const MAX_FILES = 50;
export const MAX_FILE_SIZE = 25 * 1024 * 1024;      // 25 MB
export const MAX_TOTAL_BATCH_SIZE = 750 * 1024 * 1024; // 750 MB
export const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024;  // 10 MB

interface ValidationReport {
  accepted: number[];
  overflow: number[];
  oversized: number[];
  acceptedBytes: number;
  exceedsTotalCap: boolean;
  largeFileCount: number;
  animatedGifCount: number;
}

function validateBatch(files: File[], currentCount: number): ValidationReport
```

Tests (12 unit tests): limits, validation report shape, GIF detection, total-size cap, FIFO ordering, boundary conditions.

---

## 7. The PDF Compressor Engine

### 7.1 utils/pdfProcessor.ts — Full Code (525 lines)

**Exports:**
- Types: `PdfQualityPreset`, `PdfProcessSettings`, `PdfProcessResult`, `PdfMetadata`, `PdfFilenameToken`
- Functions: `compressPdf`, `compressPdfForPreview`, `extractPdfMetadata`, `formatBytes`, `getReductionRatio`, `getQualityPresetSettings`, `getPdfFilenameTokenDocs`, `applyPdfFilenameTokens`, `toDownloadPdfFile`, `PDF_QUALITY_PRESETS`

**Lazy pdfjs loading:**
```ts
let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;
async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      return mod;
    });
  }
  return pdfjsPromise;
}
```

**compressPdf() algorithm:**
1. `file.slice(0)` to copy the buffer (pdfjs mutates input)
2. `pdfjs.getDocument({ data })` → loading task → `pdfDoc`
3. Create new `PDFDocument` via `pdf-lib`
4. Set metadata: title/producer/creator = "LS Image Compressor" (unless stripMetadata)
5. For each page (1..numPages):
   - `pdfDoc.getPage(i)` → `page`
   - `renderPageToJpeg(page, quality, scale, maxWidth)`:
     - Compute base viewport at scale=1
     - Optionally cap scale by maxWidth
     - Canvas at full size, fill white, `page.render({ canvasContext, viewport }).promise`
     - `canvas.toBlob('image/jpeg', quality)`
   - `outDoc.embedJpg(bytes)` → embed as image
   - `outDoc.addPage([width, height])` → add page
   - `newPage.drawImage(jpegImage, { x:0, y:0, width, height })`
   - `page.cleanup()`
   - Call `onProgress(i/totalPages, i, totalPages)`
   - Yield to event loop every 3 pages (`await new Promise(r => setTimeout(r, 0))`)
6. `pdfDoc.cleanup()` (free source)
7. `outDoc.save({ useObjectStreams: true })` → Uint8Array
8. Wrap in `Blob([u8], { type: 'application/pdf' })`
9. Return `{ blob, pageCount, sizeBytes, reduction, quality, scale, durationMs, finalQuality, finalDpi }`

**compressPdfForPreview()** — target-size iteration: decrements quality and DPI up to 5 iterations until output fits target KB.

**extractPdfMetadata()** — smart recommendation engine:
- Reads page size → classifies as A4/Letter/Legal/A3/A5/Custom
- Heuristic: scans first page bitmap variance → image-heavy vs text-heavy
- Returns `recommendedPreset`, `recommendedQuality`, `estimatedSavings`, `recommendationReason`

**PDF Filename tokens:** `{name}`, `{ext}`, `{format}`, `{pages}`, `{size}`, `{date}`, `{q}`, `{index}`

### 7.2 utils/pdfFormat.ts

```ts
export const PDF_QUALITY_PRESETS = {
  low:    { quality: 0.4,  scale: 1.25, maxWidth: 1100 },
  medium: { quality: 0.6,  scale: 1.75, maxWidth: 1700 },
  high:   { quality: 0.82, scale: 2.25, maxWidth: 2400 },
} as const;
```

### 7.3 usePdfUpload hook

Similar to `useImageUpload` with differences:
- `MAX_PDF_FILES = 5`, `MAX_PDF_SIZE = 100 MB`
- `UploadedPdf` has `progress: number` (0..1 per-file), `pageCount: number | null`, `metadata?: PdfMetadata`
- `getPdfPageCount(file)` lazy-loads pdfjs
- Re-exports `formatBytes`, `getReductionRatio` from pdfProcessor

---

## 8. The Bulk Renamer Engine

### 8.1 utils/fileRenamer.ts — Full Code (509 lines)

**13 Rule Kinds:**

| Kind | Editor Fields | Logic |
|---|---|---|
| `replace` | find, replace, regex, caseInsensitive | `String.replaceAll` or regex replace |
| `prefix` | text | Prepends text |
| `suffix` | text | Appends text |
| `numbering` | position(start/end), separator, start, pad | Adds index counter |
| `case` | mode(lower/UPPER/Title/Sentence) | Case conversion |
| `whitespace` | mode(hyphen/underscore/remove/collapse) | Whitespace replacement |
| `removeChars` | chars | Regex-escapes and removes |
| `date` | format, separator, position, useCurrent | Date formatting |
| `insertAt` | index, text | Insert at position |
| `trim` | mode, count, ellipsis | Trim or truncate |
| `replaceExt` | mode(set/lower/UPPER/none), ext | Extension modification |
| `extractCounter` | where(first/last), position, separator, pad, fallbackStart | Extract numbers from name |
| `reverse` | (no fields) | Reverse string |

**RenameRule union type:**
```ts
type RenameRule = 
  | { kind: 'replace'; find: string; replace: string; regex: boolean; caseInsensitive: boolean }
  | { kind: 'prefix'; text: string }
  | { kind: 'suffix'; text: string }
  | { kind: 'numbering'; position: 'start' | 'end'; separator: string; start: number; pad: number; enabled: boolean }
  | { kind: 'case'; mode: 'lower' | 'upper' | 'title' | 'sentence' }
  | { kind: 'whitespace'; mode: 'hyphen' | 'underscore' | 'remove' | 'collapse' }
  | { kind: 'removeChars'; chars: string }
  | { kind: 'date'; format: string; separator: string; position: 'prefix' | 'suffix'; useCurrent: boolean }
  | { kind: 'insertAt'; index: number; text: string }
  | { kind: 'trim'; mode: 'start' | 'end' | 'both' | 'truncate'; count: number; ellipsis: boolean }
  | { kind: 'replaceExt'; mode: 'set' | 'lower' | 'upper' | 'none'; ext: string }
  | { kind: 'extractCounter'; where: 'first' | 'last'; position: 'start' | 'end'; separator: string; pad: number; fallbackStart: number }
  | { kind: 'reverse' };
```

**Key Functions:**
- `splitExtension(name)` — splits at last `.`, handles leading dots and trailing dots
- `renameBase(base, rules, index, total, context?)` — iterates rules in order, dispatches to `apply*` helpers
- `buildRenamePlan({ files, rules })` — splits rules into baseRules and extRules, processes each file, deduplicates by appending ` (2)`, ` (3)`, etc.
- `sanitizeFileName(name)` — strips illegal chars (`<>:"/\|?*` + control chars), collapses underscores, trims dots/whitespace, caps at 200 chars, falls back to `'untitled'`

### 8.2 useFileRename hook

**State:** `files: RenameFile[]`, `rules: RenameRule[]`, `isZipping: boolean`, `zipProgress: number`

**Constants:** `MAX_RENAME_FILES = 100`, `MAX_RENAME_SIZE = 200 MB`

**Memoized:** `plan` (via `buildRenamePlan`), `changedCount`, `totalSize`

**downloadZip() flow:**
1. Create `new JSZip()`, get `'renamed'` subfolder
2. Add each file with sanitized name → progress 0-90%
3. `zip.generateAsync({ type: 'blob', compression: 'STORE' })` → progress 90-100%
4. `saveAs(blob, 'ls-image-compressor-rename.zip')`
5. Toast success + cleanup

---

## 9. Hooks (State Machines)

### 9.1 useClipboardPaste

```ts
function useClipboardPaste({ 
  onPaste: (files: File[]) => void, 
  enabled = true, 
  accept: 'image' | 'pdf' | 'all' 
})
```

Document-level `paste` listener:
- Skips if target is input/textarea/contentEditable
- Filters by accept type
- `e.preventDefault()`, calls `onPaste(Array.from(e.clipboardData.files))`

### 9.2 usePageDropZone

```ts
function usePageDropZone({ 
  onDrop: (files: File[]) => void, 
  enabled = true, 
  accept: 'image' | 'pdf' | 'all' 
}): { isDragging: boolean }
```

Document-level drag tracker with `depth` counter (dragenter++ / dragleave--) to prevent flickering. Shows overlay only for file drags (`dataTransfer.types` contains `'Files'`).

### 9.3 useIsMobile / use-mobile

```tsx
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
};
```

### 9.4 use-toast (Radix toast reducer)

Standard shadcn toast state machine. `TOAST_LIMIT = 1`, `TOAST_REMOVE_DELAY = 1_000_000` (never auto-remove). Exposes `toast({...})` and `useToast()`.

---

## 10. Components

### 10.1 Header.tsx

- Fixed top, `z-50`, `backdrop-blur-xl` bg
- Gradient top border line
- Logo: ⚡ in rounded square + "LS Image Compressor" gradient text
- Desktop nav: How It Works / Features / FAQ (anchor links on `/`) + Compress PDF + Bulk Rename + theme toggle
- Mobile nav: hamburger → right slide-in panel with all links + About/Privacy/Terms/Contact
- Mobile menu: body scroll lock, Escape to close, auto-focus first link
- Scroll detection: adds shadow when `scrollY > 20`
- Prefetch on hover for desktop nav links

### 10.2 Footer.tsx

- 4-column desktop / single-column mobile
- Social icons: Instagram, LinkedIn, GitHub, CodePen, Mail, Website
- `handleAnchorClick`: smooth-scrolls on `/`, else normal `<a>` behavior
- Copyright: `© 2026 LS Image Compressor`

### 10.3 ToolHero.tsx

Shared hero for all 3 tools:
- `min-h-[100svh]` full-viewport
- Radial gradient mesh background (4 ellipses)
- 3 floating blurred shapes (framer-motion y/scale keyframes, 18-25s)
- Headline (gradient text) + subhead + 4 trust badges
- Upload zone in staggered motion.div
- `children` slot for queue + settings injection
- `tool` prop (`'image' | 'pdf' | 'rename'`) customizes headline and badges

### 10.4 UploadZone.tsx

```tsx
{ onFilesSelected, imageCount, maxFiles = 50 }
```

- `accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/bmp"`
- Disabled state when full
- Keyboard accessible: `role="button"`, tabIndex, Enter/Space
- Hidden `<input ref={inputRef} multiple>`

### 10.5 ImageQueue.tsx

- Grid/list view toggle
- Per-file card: 56×56 thumbnail, status overlay, truncated name, size+dims, reduction badge, retry/inspect/remove buttons
- Progress bar with shimmer + ETA
- "Compress N images" button

### 10.6 SettingsPanel.tsx

4 tabs (Radix Tabs):
1. **Quality**: 4 presets (max/high/balanced/compact), quality slider (10-100), auto-optimize switch, target size KB input
2. **Resize**: Width/Height inputs with aspect lock, 9 social media presets
3. **Format**: WebP/AVIF/JPEG/PNG/Original with browser capability detection
4. **Output**: Rotation (0/90/180/270), Mirror, Grayscale, Strip EXIF, Filename pattern with token inserter popover

### 10.7 ResultsSection.tsx

- IntersectionObserver fade-in
- `useCountUp` animated 3 stat tiles (Images/Saved KB/% Smaller)
- Per-file before/after cards with thumbnails + reduction badge
- Download per-file or ZIP
- Share row: Twitter/X, WhatsApp, Copy Link
- "Process More" reset button

### 10.8 ComparisonView.tsx (649 lines)

Three modes:
1. **Side-by-side**: Two panels with divider
2. **Slider** (default): Drag vertical line to reveal before/after via `clipPath`
3. **Toggle**: Flip between before/after on click

Features: pinch/wheel zoom (0.5x-8x), pointer-capture pan, checkerboard bg for transparency, keyboard shortcuts (1/2/3 modes, arrows, +/-/0 zoom, Space toggle).

### 10.9 ErrorBoundary.tsx

Class component:
- `getDerivedStateFromError` → `hasError: true`
- `componentDidCatch` checks for `ChunkLoadError` → `chunkError: true` → shows "New version available — Reload"
- Shows friendly card with Try Again / Go Home + collapsible technical details

### 10.10 LazySection.tsx

IntersectionObserver-gated mount:
- `rootMargin` default 200px
- Reserves `minHeight` (default 200px) before mounting
- After intersect: `requestIdleCallback` (1500ms) or `setTimeout(200ms)` → mount children
- Renders `<BlockSkeleton />` as placeholder

### 10.11 Skeleton.tsx

Four exports: `RouteSkeleton` (full page), `BlockSkeleton` (single pulse), `CardSkeleton` (avatar + lines), `QueueSkeleton` (4 cards in grid).

### 10.12 PDF-Specific Components

**PdfUploadZone.tsx**: Mirror of UploadZone — `accept="application/pdf,.pdf"`, maxFiles=5, maxFile=100 MB.

**PdfQueue.tsx**: Single column, first-page thumbnail (pdfjs render), page count, per-file progress bar, smart recommendation chip.

**PdfSettingsPanel.tsx**: 3 presets (Strong/Balanced/Light), JPEG quality slider (10-95%), DPI override (72/96/150/300), target size KB, grayscale, strip metadata, page range, filename pattern.

**PdfResultsSection.tsx**: FileText icons, 3 stat tiles, per-file rows with name/size/reduction/pages/badge, iframe preview, ZIP download, confetti burst.

**PdfInspector.tsx**: iframe preview, metadata card, smart recommendation card, download button, privacy badge.

### 10.13 Renamer-Specific Components

**FileRenameUploadZone.tsx**: No accept filter, maxFiles=100, maxSize=200 MB.

**FileRenameRuleBuilder.tsx** (845 lines — biggest component):
- Add rule → grid of 13 rule types
- Each rule: numbered badge, label, up/down/trash buttons, RuleEditor with kind-specific fields
- Factory object `addableRuleTypes` defines defaults for each kind

**FileRenamePreviewList.tsx**:
- Per-file: original (strikethrough) → renamed (highlighted diff)
- `highlightDiff()` finds common prefix/suffix, wraps middle in primary-colored pill
- Header: N files · X renamed · Y total
- Progress bar + ZIP download button

### 10.14 DocumentTitle.tsx

Pure side-effect component (returns `null`):
- `useLayoutEffect` for before-paint title change
- `setMeta(name, content)` — auto-detects og:/article:/al:/music:/etc. families for `property=` vs `name=`
- `setLink(rel, href)` — upserts `<link>` elements
- `injectJsonLd(data)` — removes old `[data-page-jsonld]`, appends new ones
- Sets robots, alternate locales (en_IN, en_GB)
- Suffix defaults to site name, no double-suffix

---

## 11. Pages

### 11.1 Index.tsx (Image Tool — Home Page)

Hooks: `useImageUpload`, `useSettings`, `useClipboardPaste`, `usePageDropZone`

Layout:
```tsx
<Header />
<main>
  <HeroSection onFilesSelected={addFiles} imageCount={files.length}>
    {hasFiles && <SettingsPanel ... />}
    <ImageQueue ... />
  </HeroSection>
  {allDone && processedFiles.length > 0 && <ResultsSection ... />}
  <LazySection><TrustBar /></LazySection>
  <LazySection><HowItWorks /></LazySection>
  <LazySection><FeaturesGrid /></LazySection>
  <LazySection><FAQSection /></LazySection>
  <Footer />
</main>
<PageDropOverlay visible={isDragging} />
<MobileActionBar />
<ScrollToTop />
<ImageInspector file={...} open={...} onOpenChange={...} />
<DocumentTitle {...pageSeo.home} />
```

### 11.2 CompressPdf.tsx

Hooks: `usePdfUpload`, `useClipboardPaste` (pdf filter), `usePageDropZone` (pdf filter)

Layout: ToolHero → PdfUploadZone → PdfSettingsPanel → PdfQueue → PdfResultsSection → inline HowItWorksPdf/FeaturesPdf/FaqPdf → Footer → PdfInspector.

### 11.3 BulkRename.tsx

Hooks: `useFileRename`, `useClipboardPaste` (all), `usePageDropZone` (all)

Layout: ToolHero → FileRenameUploadZone → FileRenameRuleBuilder → FileRenamePreviewList → StatsRow → inline HowItWorks/Features/FAQ → Footer.

### 11.4 About.tsx (1701 lines)

Sections: Hero → Stats (4 count-up tiles) → Pillars (Mission/Vision/Story) → Journey timeline → Philosophy → Values → Tech stack → Built For audiences → Profile (ProfileImage + bio + skills + social links) → CTA.

Uses: inline `useCountUp`, inline `formatCompact`, `SECTION_DIVIDER` constant, framer-motion `useInView`.

### 11.5 Contact.tsx (913 lines)

Channels (email/GitHub/LinkedIn/Instagram), FAQ-style "Common questions", map placeholder, response time card. Phosphor icons.

### 11.6 PrivacyPolicy.tsx / TermsOfService.tsx

Long-form legal with ToC, numbered sections, signature line. Last updated March 8, 2026.

### 11.7 NotFound.tsx (110 lines)

Motion 404: "404" gradient headline, "Page not found", "Back to home" button.

---

## 12. SEO & Theme System

### 12.1 src/config/seo.ts

**siteSeo** (global):
```ts
{
  name: 'LS Image Compressor',
  url: 'https://img.ladestack.in',
  description: '...',
  defaultOg: '/og-image.png',
  twitter: '@ladestack',
  defaultImage: { width: 1200, height: 630 }
}
```

**pageSeo** — 8 entries: `home`, `pdf`, `rename`, `about`, `contact`, `privacy`, `terms`, `notFound`.
Each has: `title`, `description`, `shortTitle`, `shortDescription`, `keywords`, `canonical`, `ogImage`, `ogType`, `twitterCard`, `noindex`, `jsonLd`.

### 12.2 Theme System

CSS variables in `src/index.css`:
- `:root` — light mode (white bg, near-black fg)
- `.dark` — dark mode (#0f0f0f bg, #f5f5f5 fg)
- All colors are monochrome/greyscale
- Custom utilities: `.glass-card`, `.gradient-text`, `.gradient-bg`, `.gradient-border`, `.glass-morphism`, `.safe-bottom`, `.shadow-elev-1/2/3`
- Animation keyframes: `accordion-down/up`, `pulse-glow`, `fade-in-up`, `shimmer`

---

## 13. Deployment & Infrastructure

### 13.1 vercel.json

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/assets/(.*)", "headers": [
      { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
    ]},
    { "source": "/(.*)", "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()" }
    ]}
  ]
}
```

### 13.2 Vercel Analytics

Loaded lazily in `App.tsx` via `VercelAnalyticsLazy` component:
- Uses `requestIdleCallback` or `setTimeout(1500ms)` fallback
- Only in production (`import.meta.env.PROD` check in `VercelAnalytics.tsx`)

### 13.3 Code Splitting (manual chunks)

| Chunk | Dependencies | Loaded when |
|---|---|---|
| `vendor-pdf` | pdfjs-dist, pdf-lib | `/compress-pdf` |
| `vendor-zip` | jszip, file-saver | `/bulk-rename` + results ZIP |
| `vendor-image` | browser-image-compression | Image tool fast path |
| `vendor-react` | react, react-dom, react-router-dom | Always |
| `vendor-motion` | framer-motion | Always |

---

## 14. Testing

### 14.1 Test Setup

```ts
// src/test/setup.ts
import "@testing-library/jest-dom";

// matchMedia polyfill
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
```

### 14.2 Test Coverage

Only `batchValidation.test.ts` has tests (12 unit tests):
- Limits validation
- ValidationReport shape
- GIF detection (MIME + extension)
- Total-size cap
- FIFO ordering
- Boundary conditions (0 files, max files, oversized)

Hooks, components, pages, and utilities are **not tested**.

---

## 15. Known Tech Debt & Improvement Targets

### Critical Issues
1. **EXIF orientation is ignored** — `getExifOrientation()` returns `1` (stub). iPhone portrait photos appear rotated.
2. **QueryClientProvider is mounted but unused** — `@tanstack/react-query` can be dropped.
3. **Duplicate toast utilities** — `src/hooks/use-toast.ts` and `src/components/ui/use-toast.ts` are identical.
4. **No CSP header** — missing `Content-Security-Policy` meta tag.
5. **30+ unused shadcn/ui components** — slimming would reduce bundle size.

### Image Tool Improvements
- True target-KB iterative loop visualization
- HEIC input support (`heic2any`)
- Animated WebP output (currently animated GIFs become static)
- Progressive JPEG / embedColorProfile / preserveMetadata (currently un-wired)

### PDF Tool Improvements
- Per-page adaptive quality (image-heavy vs text-heavy pages)
- Preserve text layer where possible (modify original PDF instead of re-rendering)
- Per-page range variations (skip cover/blank pages)

### Renamer Improvements
- Per-rule live preview on hover
- Save/load rule presets to localStorage
- Regex tester inline
- Drag-to-reorder rules (currently only up/down buttons)

### Cross-cutting
- **PWA/Service Worker** — none currently
- **i18n** — English only, could use `react-i18next`
- **Format helpers** — `formatFileSize` could use `Intl.NumberFormat`
- **Remove unused deps** — `@tanstack/react-query`, `react-hook-form`, `zod`, `date-fns`, `recharts`, `react-day-picker`, `cmdk`, `vaul`, `input-otp`
- **Add tests** — hooks, components, pages are all untested

### State Management Pattern
The app has **no global store** (no Redux/Zustand/Jotai). All state is local React state:
- `useImageUpload` / `usePdfUpload` / `useFileRename` — page-level batch processing state machines
- `useSettings` — persisted to localStorage
- `ThemeContext` — only true global context

Data flow:
```
User input (drag/paste/click) → useClipboardPaste / usePageDropZone
  → Page-level hook (useImageUpload / usePdfUpload / useFileRename)
    → Pure utility engine (imageProcessor / pdfProcessor / fileRenamer)
      → Blob/Buffer → saveAs / ZIP
```

### Code Conventions
- **No comments in code** (except JSDoc on exported functions)
- **Functional components** only (except ErrorBoundary)
- **useCallback** for every handler prop, **useMemo** for expensive derivations
- **ObjectURLs** tracked in `useRef<Set<string>>`, revoked on unmount
- **Inline styles** only for theme-driven values (gradients)
- **Sonner** for toasts: `toast.success('✅ …')`, `toast.warning('⚠️ …')`, `toast.error('❌ …')`
- **framer-motion** for all animation
- **TypeScript** with `strict: false`, `noImplicitAny: false`
- **Indentation**: 2 spaces, double quotes for JSX
- **Icons**: mix of `lucide-react` and `@phosphor-icons/react`

---

*End of MEGA-CONTEXT.md — All 100+ source files analyzed. Total lines of code: ~15,000+.*
