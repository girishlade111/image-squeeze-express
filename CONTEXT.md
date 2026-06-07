# LS Image Compressor — Full App Context (for AI-Assisted Improvements)

> **Purpose of this document:** Single-source-of-truth context dump for any AI assistant (or developer) that needs to make changes, add features, fix bugs, or refactor the **LS Image Compressor** project. Read this first before touching the code.
>
> **Project Name (internal):** `ls-image-compressor` (in `package.json`), branded as **LS Image Compressor**.
>
> **Domain:** `https://img.ladestack.in`
>
> **Author / Owner:** Lade Stack (Girish Lade) — `https://ladestack.in`

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

**Brand identity (current — monochrome):** `--primary: 0 0% 0%` (pure black), `--accent: 0 0% 9%` (near-black), with a signature `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))` text gradient. Light mode inverts to white/near-white. Dark is the **default** mode. Legacy color aliases (`--indigo`, `--teal`, `--violet`, `--cyan`, `--brand`, `--brand-2`) are **kept in `index.css` but remapped to greyscale** so old component code still compiles. Font: **Inter** (loaded from Google Fonts). The ⚡ emoji is the logo. There are also two profile photos used in the About page (`profile.webp`, `profile.avif`, `@2x` variants).

**Deploy target:** Vercel (single `vercel.json` with SPA rewrites, immutable 1y cache for hashed assets, security headers).

---

## 2. Tech Stack & Tooling

### 2.1 Runtime dependencies (`package.json`)

| Package | Why it's here |
|---|---|
| `react@^18.3.1` + `react-dom@^18.3.1` | UI framework |
| `react-router-dom@^6.30.1` | Client-side routing (`BrowserRouter` in `App.tsx`) |
| `vite@^5.4.19` + `@vitejs/plugin-react-swc@^3.11.0` | Dev server + build tool (uses SWC for fast refresh) |
| `typescript@^5.8.3` | Types (`strict` is OFF in `tsconfig.app.json` — intentional for prototyping) |
| `tailwindcss@^3.4.17` + `tailwindcss-animate@^1.0.7` | Styling (CSS variables for theming) |
| `@tanstack/react-query@^5.83.0` | Installed and wrapped in `QueryClientProvider` in `App.tsx` but **not actively used** — kept for future server-backed features |
| `framer-motion@^12.38.0` | All UI animations (hero blobs, queue item transitions, modal springs, etc.) |
| `@phosphor-icons/react@^2.1.7` | Primary icon library (Lightning, ShieldCheck, Sparkle, Stack, FilePdf, ArrowUpRight, ListChecks, FilePlus, etc.) — used in tool hero, features, upload zones, inspector |
| `lucide-react@^0.462.0` | Secondary icon library (CloudUpload, Sparkles, Zap, Shield, X, Loader2, Check, AlertCircle, RotateCcw, Plus, Download, RefreshCw, ImageIcon, FileArchive, Share2, Eye, FileText, Hash, etc.) — used heavily in queues, buttons, settings |
| `sonner@^1.7.4` | Toast notifications (used in every hook) |
| `next-themes@^0.3.0` | Theme resolution infrastructure (theme handling is in `contexts/ThemeContext.tsx`) |
| `browser-image-compression@^2.0.2` | Heavy lifting for the image fast path (workers + smart re-encoding) |
| `pdf-lib@^1.17.1` | Rebuilds compressed PDFs from rasterized pages |
| `pdfjs-dist@^6.0.227` | Parses the source PDF and renders each page to a canvas (worker file lives at `public/pdf.worker.min.mjs`, 1.2 MB) |
| `jszip@^3.10.1` | Builds the bulk-rename ZIP and the multi-file download ZIP |
| `file-saver@^2.0.5` | Triggers a browser download from a `Blob` |
| `zod@^3.25.76` | Installed but not currently consumed (kept for future form/validation use) |
| `react-hook-form@^7.61.1` + `@hookform/resolvers@^3.10.0` | Installed but not currently consumed |
| `date-fns@^3.6.0` | Installed but not currently consumed (the date rule in the file renamer uses its own `formatDate`) |
| `recharts@^2.15.4`, `react-day-picker@^8.10.1`, `react-resizable-panels@^2.1.9`, `embla-carousel-react@^8.6.0`, `cmdk@^1.1.1`, `vaul@^0.9.9`, `input-otp@^1.4.2` | shadcn/ui peer deps — installed but **none of these widgets are used in the current pages** |
| `class-variance-authority@^0.7.1`, `clsx@^2.1.1`, `tailwind-merge@^2.6.0` | Required by the shadcn/ui `cn()` helper at `src/lib/utils.ts` |
| Every `@radix-ui/react-*` package in the dep list | Required by the corresponding shadcn/ui primitive in `src/components/ui/`. The app **directly** consumes: `slider`, `tabs`, `switch`, `tooltip`, `dialog`, `sonner`, `toast`, `popover`, `select`, `label`, `button`, `input`, `badge`, `accordion`, `checkbox` |

### 2.2 Dev dependencies (test infra, analytics)

- `vitest@^3.2.4` + `jsdom@^20.0.3` + `@testing-library/react@^16.0.0` + `@testing-library/jest-dom@^6.6.0`
- `@vercel/analytics@^1.5.0` + `@vercel/speed-insights@^1.2.0` — mounted in `src/VercelAnalytics.tsx` and loaded **only on idle** (requestIdleCallback / 1500ms fallback) via `prefetchOnIdle`
- `eslint@^9.32.0` (flat config in `eslint.config.js`) + `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- `lovable-tagger@^1.1.13` — dev-only plugin in `vite.config.ts` for component tagging

### 2.3 NPM scripts

```json
"dev": "vite"                  // dev server on 0.0.0.0:8080
"build": "vite build"          // production build → dist/
"build:dev": "vite build --mode development"
"lint": "eslint ."
"preview": "vite preview"
"test": "vitest run"           // CI-friendly: runs once
"test:watch": "vitest"         // watch mode
"og:gen": "node scripts/generate-og-images.mjs"   // regenerate the 6 OG images
"og:optimize": "node scripts/optimize-profile.mjs" // re-encode profile image to AVIF/WebP
```

The repo also has `bun.lock` and `bun.lockb` (uses Bun as a possible package manager), `package-lock.json` (npm fallback), and a `dist/` build output.

### 2.4 Config files

- **`vite.config.ts`** — alias `@` → `./src`, dev server on port **8080** bound to `0.0.0.0`, HMR overlay disabled (canvas/preview errors don't block the user), `lovable-tagger` is only injected in dev mode, **manual chunks** to split heavy deps:
  - `vendor-pdf` → `pdfjs-dist` + `pdf-lib`
  - `vendor-zip` → `jszip` + `file-saver`
  - `vendor-image` → `browser-image-compression`
  - `vendor-react` → React + ReactDOM + React Router
  - `vendor-motion` → `framer-motion`
  - everything else goes into the default chunk
- **`vitest.config.ts`** — `jsdom` env, globals, `setupFiles: ./src/test/setup.ts`, alias `@` mirrors the Vite one.
- **`tailwind.config.ts`** — `darkMode: ['class']`, custom `container`, custom colors all bound to CSS variables (defined in `src/index.css` under `:root` and `.dark`), custom keyframes (`accordion-down`, `pulse-glow`, `fade-in-up`, `shimmer`), `fontFamily.sans: Inter`. Note: the `darkMode: ['class']` strategy is the **default** Tailwind dark-mode, used by the `dark:` variant. The actual theme system is driven by toggling `.dark` on `<html>` via `ThemeProvider`.
- **`tsconfig.json`** (root) — references `tsconfig.app.json` and `tsconfig.node.json`. `strictNullChecks: false` and `noImplicitAny: false` are intentionally relaxed.
- **`tsconfig.app.json`** — `strict: false`, `target: ES2020`, `jsx: react-jsx`, `types: ["vitest/globals"]`. Path alias `@/* → ./src/*`.
- **`tsconfig.node.json`** — for `vite.config.ts`, `strict: true`.
- **`eslint.config.js`** — flat config: browser globals, `react-hooks` + `react-refresh`, `@typescript-eslint/no-unused-vars: off` (intentionally lenient).
- **`postcss.config.js`** — `tailwindcss` + `autoprefixer`.
- **`components.json`** — shadcn/ui config (style: default, RSC: false, baseColor: slate, css variables: true).
- **`vercel.json`** — see §13.
- **`index.html`** — heavy SEO setup (see §14).
- **`scripts/generate-og-images.mjs`** — uses `satori` + `sharp` to regenerate the 6 OG image PNGs (home/pdf/rename/about/contact/privacy/terms) from inline React-JSX-style templates. Output: `public/og-*.png`. SVGs are also committed (`public/og-*.svg`).
- **`scripts/optimize-profile.mjs`** — sharp-based re-encoder that takes a source photo and emits `src/assets/profile.{webp,avif}` at 1x and `@2x` sizes for `<picture>` srcsets.

### 2.5 Path alias

`@` → `src`. Used everywhere (`@/components/...`, `@/hooks/...`, `@/utils/...`, `@/lib/utils`, `@/contexts/ThemeContext`, `@/config/seo`).

---

## 3. Directory Map

```
image-squeeze-express/
├── index.html                       # SEO + theme bootstrap + root mount
├── package.json
├── vite.config.ts                   # @ alias, port 8080, manualChunks, lovable-tagger (dev only)
├── vitest.config.ts                 # jsdom + @ alias + setupFiles
├── tailwind.config.ts               # Custom CSS-var colors, animations
├── tsconfig.{json,app,node}.json
├── eslint.config.js                 # Flat config, lenient
├── postcss.config.js
├── components.json                  # shadcn/ui config
├── vercel.json                      # SPA rewrites + cache + security headers
├── public/
│   ├── favicon.svg                  # ⚡ emoji logo
│   ├── favicon-16x16.png / favicon-32x32.png / apple-touch-icon.png / apple-touch-icon.svg
│   ├── logo-mark.svg                # Just the ⚡ mark
│   ├── placeholder.svg              # For any future image fallbacks
│   ├── pdf.worker.min.mjs           # pdfjs worker (1.2 MB, loaded via /pdf.worker.min.mjs)
│   ├── robots.txt                   # 7KB — extensive bot directives
│   ├── sitemap.xml + sitemap-index.xml + image-sitemap.xml
│   ├── og-image.png/svg             # Default OG (home)
│   ├── og-pdf.png/svg               # PDF tool
│   ├── og-rename.png/svg            # Renamer tool
│   ├── og-about.png/svg             # About page
│   ├── og-contact.png/svg           # Contact page
│   ├── og-privacy.png/svg           # Privacy page
│   ├── og-terms.png/svg             # Terms page
├── scripts/
│   ├── generate-og-images.mjs       # satori + sharp OG image generator
│   └── optimize-profile.mjs         # sharp profile image AVIF/WebP re-encoder
├── src/
│   ├── main.tsx                     # ReactDOM.createRoot mount
│   ├── App.tsx                      # Providers + routes (lazy-loaded) + ErrorBoundary
│   ├── VercelAnalytics.tsx          # Idle-loaded analytics + speed-insights
│   ├── index.css                    # Tailwind + theme CSS variables + custom utilities
│   ├── vite-env.d.ts
│   ├── assets/
│   │   ├── profile.webp
│   │   ├── profile@2x.webp
│   │   ├── profile.avif
│   │   └── profile@2x.avif          # About page profile photo, 4 variants for <picture>
│   ├── components/                  # 27 app-level components
│   │   ├── ui/                      # 49 shadcn/ui primitives (most unused, see §2.1)
│   │   ├── Header.tsx               # Fixed top nav with mobile drawer, theme toggle, prefetch-on-hover
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx          # Thin wrapper around ToolHero
│   │   ├── ToolHero.tsx             # Shared hero: gradient mesh, floating blobs, headline, badges
│   │   ├── TrustBar.tsx             # 6-tile "Why teams trust" strip
│   │   ├── UploadZone.tsx           # Image drop zone (drag/drop + click)
│   │   ├── ImageQueue.tsx           # Image file grid with per-file status + ETA + stats
│   │   ├── SettingsPanel.tsx        # Tabbed Quality/Resize/Format/Output + Social Presets
│   │   ├── ResultsSection.tsx       # After-compress summary + ZIP
│   │   ├── ImageInspector.tsx       # Detailed image preview dialog
│   │   ├── ComparisonView.tsx       # Side/Slider/Toggle before-after view (zoom, pan, keyboard)
│   │   ├── EmptyState.tsx           # Centered empty-state with icon/title/action
│   │   ├── ErrorBoundary.tsx        # Route-level error boundary w/ chunk-load detection
│   │   ├── MobileActionBar.tsx      # Sticky mobile-only CTA bar
│   │   ├── PageDropOverlay.tsx      # Full-page drop overlay
│   │   ├── LazySection.tsx          # IntersectionObserver-gated mount w/ BlockSkeleton fallback
│   │   ├── NavLink.tsx              # Thin wrapper around react-router NavLink
│   │   ├── ProfileImage.tsx         # Polished portrait/landscape <picture> wrapper
│   │   ├── ScrollToTop.tsx          # Floating back-to-top button
│   │   ├── Skeleton.tsx             # RouteSkeleton / BlockSkeleton / CardSkeleton / QueueSkeleton
│   │   ├── HowItWorks.tsx           # 3-step "How It Works" section
│   │   ├── FeaturesGrid.tsx         # 6-tile bento feature grid
│   │   ├── FAQSection.tsx           # 12 Q&A accordion
│   │   ├── DocumentTitle.tsx        # Per-route <title>/meta/JSON-LD injector
│   │   ├── PdfUploadZone.tsx        # PDF drop zone
│   │   ├── PdfQueue.tsx             # PDF file list w/ per-file page progress + ETA
│   │   ├── PdfSettingsPanel.tsx     # PDF presets + slider + DPI/target/gray/strip/range/filename
│   │   ├── PdfResultsSection.tsx    # PDF results + iframe preview + ZIP
│   │   ├── PdfInspector.tsx         # Detailed PDF preview dialog w/ smart recommendation
│   │   ├── FileRenameUploadZone.tsx # Any-file drop zone for renamer
│   │   ├── FileRenameRuleBuilder.tsx # Add/remove/reorder 13 rule kinds (845 lines)
│   │   └── FileRenamePreviewList.tsx # Live rename preview with diff highlight
│   ├── config/
│   │   └── seo.ts                   # Per-page SEO registry (8 pages)
│   ├── contexts/
│   │   └── ThemeContext.tsx         # dark/light toggle, persists to localStorage
│   ├── hooks/                       # 8 custom hooks
│   │   ├── useImageUpload.ts        # State machine for image batch (the big one)
│   │   ├── usePdfUpload.ts          # State machine for PDF batch w/ page count + ETA
│   │   ├── useFileRename.ts         # State machine for renamer + ZIP building
│   │   ├── useSettings.ts           # Compression settings + localStorage persistence
│   │   ├── useClipboardPaste.ts     # Listens for paste events at document level
│   │   ├── usePageDropZone.ts       # Tracks drag state + collects dropped files
│   │   ├── use-toast.ts             # Radix toast reducer (used by legacy <Toaster/>)
│   │   ├── use-mobile.tsx           # Detects < 768px viewport
│   │   └── imageUploadLimits.ts     # Constants: MAX_FILES, MAX_FILE_SIZE, MAX_TOTAL_BATCH_SIZE
│   ├── lib/
│   │   ├── utils.ts                 # `cn()` (clsx + tailwind-merge)
│   │   ├── motion.ts                # Shared framer-motion variants: fadeInUp, staggerContainer, etc.
│   │   └── prefetch.ts              # usePrefetchOnHover + prefetchOnIdle (see §15)
│   ├── pages/                       # 8 route components
│   │   ├── Index.tsx                # Home (image tool) — 7.4 KB
│   │   ├── CompressPdf.tsx          # PDF tool — 13.6 KB
│   │   ├── BulkRename.tsx           # Renamer tool — 12.2 KB
│   │   ├── About.tsx                # 1687 lines, 70 KB — full story, stats, philosophy
│   │   ├── Contact.tsx              # 35 KB — channels, FAQ, map
│   │   ├── PrivacyPolicy.tsx        # Privacy policy
│   │   ├── TermsOfService.tsx       # Terms of service
│   │   └── NotFound.tsx             # 404 with motion + return-home button
│   ├── utils/                       # Pure logic (the "engine")
│   │   ├── imageProcessor.ts        # Canvas-based image pipeline + filename tokens
│   │   ├── pdfProcessor.ts          # pdfjs → JPEGs → pdf-lib, w/ smart recommendation
│   │   ├── pdfFormat.ts             # PDF quality presets + filename token docs
│   │   ├── fileRenamer.ts           # 13-rule rename engine
│   │   └── batchValidation.ts       # Pure batch validation w/ report (MAX_FILES=50, etc.)
│   └── test/
│       ├── setup.ts                 # matchMedia polyfill + jest-dom
│       └── batchValidation.test.ts  # 12 unit tests for the batch validator
```

---

## 4. App Bootstrap & Routing

### 4.1 `src/main.tsx` (5 lines)

```tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### 4.2 `src/App.tsx`

Provider stack, top to bottom:

```
<ThemeProvider>                    // dark/light, persisted to localStorage('ls-image-compressor-theme')
  <TooltipProvider>                 // Radix tooltip root
    <BrowserRouter>
      <ErrorBoundary>               // Route-level — also catches ChunkLoadError
        <Suspense fallback={<RouteSkeleton />}>
          <Routes>
            <Route path="/" element={<Index />} />           // eager (main feature)
            <Route path="/compress-pdf" element={<CompressPdf />} /> // lazy
            <Route path="/bulk-rename" element={<BulkRename />} />   // lazy
            <Route path="/about" element={<About />} />              // lazy
            <Route path="/contact" element={<Contact />} />          // lazy
            <Route path="/privacy" element={<PrivacyPolicy />} />    // lazy
            <Route path="/terms" element={<TermsOfService />} />     // lazy
            <Route path="*" element={<NotFound />} />                // lazy
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
    <Toaster />                     // Radix toast viewport (legacy)
    <Sonner />                      // Sonner toast viewport (the one actually used)
  </TooltipProvider>
</ThemeProvider>
<VercelAnalytics />                // Idle-loaded via prefetchOnIdle (rendered at root)
```

> **Performance note:** `Index` is the only non-lazy route because it's the landing page. All other pages are split off via `React.lazy`. The `Suspense` fallback is `<RouteSkeleton />` (neutral surface with subtle pulses) instead of a blank colored div. `ErrorBoundary` wraps the whole route tree and detects `ChunkLoadError` to show a "New version available" reload prompt instead of a generic crash.

### 4.3 `src/VercelAnalytics.tsx`

One-liner export of `import.meta.env.PROD ? <Analytics/><SpeedInsights /> : null`. Both are wrapped in `prefetchOnIdle` from `src/lib/prefetch.ts` so they never compete with the LCP for bandwidth.

### 4.4 `src/contexts/ThemeContext.tsx`

- Context value: `{ darkMode: boolean, toggleDarkMode: () => void }`
- Initial value is read from `localStorage['ls-image-compressor-theme']`; default is `true` (dark) if missing.
- On every change, toggles `document.documentElement.classList.toggle('dark', darkMode)` and writes back to `localStorage`.
- `index.html` has an **inline script** that reads `localStorage.ls-image-compressor-theme` *before React mounts* and toggles the `dark` class on `<html>` — this prevents the dark→light flash on reload.

### 4.5 `src/config/seo.ts`

Single source of truth for per-page SEO. Exports:

- `siteSeo` — global values: `name`, `url`, `description`, `defaultOg`, `twitter`, `defaultImage` (`{ width, height }`).
- `pageSeo.home / pdf / rename / about / contact / privacy / terms / notFound` — each with `title`, `description`, `shortTitle`, `shortDescription`, `keywords`, `canonical`, `ogImage`, `ogType`, `twitterCard`, `noindex`, `jsonLd` (object or array).

The `DocumentTitle` component reads this on mount and writes `<title>`, `<meta>`, `<link rel="canonical">`, and injects `<script type="application/ld+json">` blocks (tagged `data-page-jsonld` so re-mounts replace cleanly).

### 4.6 `src/components/DocumentTitle.tsx`

- Props: `title`, `description`, `shortTitle`, `shortDescription`, `keywords`, `canonical`, `ogImage`, `ogType`, `twitterCard`, `noindex`, `jsonLd`, `suffix`.
- Uses `useLayoutEffect` so the title changes before paint.
- `setMeta(name, content)` — auto-detects `og:` / `article:` / `al:` / `music:` / `video:` / `book:` / `profile:` families and uses `property=` instead of `name=`.
- `setLink(rel, href)` — upserts a `<link>` element.
- `injectJsonLd(data)` — removes any `[data-page-jsonld]` script first, then appends one per item.
- Suffix defaults to `siteSeo.name`; if the title already includes it, no double-suffix.
- Sets `og:locale:alternate` for `en_IN` and `en_GB` (alongside `en_US`).
- Sets `robots` and `googlebot` to the same directive — `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` (or `noindex, nofollow` when `noindex`).
- Returns `null` — pure side-effect component.

---

## 5. The Image Compressor (Home Page)

### 5.1 Page: `src/pages/Index.tsx` (7.4 KB)

Composes the entire image tool. Reads the following hooks/state:
- `useImageUpload()` — file queue, processing state, per-file results, stats, ETA
- `useSettings()` — compression config (persisted to `localStorage['ls-image-compressor-settings']`)
- `useClipboardPaste({ onPaste: addFiles, accept: 'image' })` — accepts Ctrl+V image pastes anywhere
- `usePageDropZone({ onDrop: addFiles, accept: 'image' })` — full-page drag-drop overlay
- `useState` for the inspector + a scroll-to-results effect

Layout:
```
<Header />                             // from components/Header
<main>
  <HeroSection onFilesSelected={addFiles} imageCount={files.length}>
    {/* children injected below: */}
    {hasFiles && <SettingsPanel ... />}
    <ImageQueue ... />
  </HeroSection>

  {allDone && processedFiles.length > 0 && <ResultsSection files={processedFiles} onReset={clearAll} />}

  <LazySection id="trust-bar"><TrustBar /></LazySection>
  <LazySection id="how-it-works"><HowItWorks /></LazySection>
  <LazySection id="features"><FeaturesGrid /></LazySection>
  <LazySection id="faq"><FAQSection /></LazySection>
  <Footer />
</main>
<PageDropOverlay visible={isDragging} />
<MobileActionBar visible={...} onCta={...} ctaLabel="Compress" ctaIcon={Lightning} />
<ScrollToTop />
<ImageInspector file={...} open={...} onOpenChange={...} />
```

The `sourceDims` array (`files.filter(f => f.originalWidth > 0).map(...))` is passed to `SettingsPanel` so the panel can compute aspect-ratio-aware width/height derivations in real time.

`handleAddMore` scrolls back to the upload zone and programmatically clicks the hidden `<input type="file" accept^="image">`.

### 5.2 `HeroSection` (`src/components/HeroSection.tsx`)

Thin 30-line wrapper around `<ToolHero tool="image" ... />` that injects the queue + settings as children.

### 5.3 `ToolHero` (`src/components/ToolHero.tsx`)

Shared full-viewport hero (`min-h-[100svh]`) with:
- Layered radial-gradient mesh background (4 ellipses in primary/accent colors)
- 3 floating blurred shapes animated with `framer-motion` (looping y/scale keyframes, durations 18-25s)
- Headline: "Compress Images **Up to 90%** Instantly & Privately" (gradient text)
- Subhead, 4 trust badges (🔒 100% Private, ⚡ Instant, 🆓 Free Forever, 📦 Batch (50))
- The `<UploadZone>` in a `motion.div` with staggered fade-in
- `children` are passed through for the queue + settings to be injected

The `tool` prop (`'image' | 'pdf' | 'rename'`) customizes the headline and badges per tool.

### 5.4 `UploadZone` (`src/components/UploadZone.tsx`)

The reusable drag/drop + click-to-upload zone. Props:
```ts
{ onFilesSelected: (files: FileList | File[]) => void, imageCount: number, maxFiles?: number = 50 }
```
- `accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/bmp"`
- `disabled` state when `imageCount >= maxFiles` (visually fades to 60% opacity, no pointer events)
- Keyboard accessible: `role="button"`, `tabIndex`, Enter/Space to open file dialog
- Drop handlers propagate to `onFilesSelected`
- Hidden `<input ref={inputRef} multiple>` is the underlying file picker
- Submits to the hook → `addFiles(...)` → see §5.7

### 5.5 `SettingsPanel` (`src/components/SettingsPanel.tsx`)

Tabbed UI (Radix Tabs) with 4 tabs: **Quality / Resize / Format / Output**. Inputs all flow back to `useSettings` via `onUpdate(partial)` etc.

#### Tab 1 — Quality
- **4 quick presets** (max=100, high=90, balanced=75, compact=50) — clicking calls `applyQualityPreset(p)`
- **Quality slider** (Radix Slider) 10–100, default 75. If `autoOptimize` is on, displays "Auto" instead of the number
- **Auto Optimize switch** — when toggled, sets `qualityPreset: 'balanced' | 'custom'`
- **Target File Size** — numeric input (KB). When filled, autoOptimize is forced on. The processor will iteratively reduce quality to hit the target (see §5.8)

#### Tab 2 — Resize
- Two numeric inputs (Width, Height) — `onSetWidth`/`onSetHeight` use `computeAspectDimensions(...)` to auto-derive the missing dimension from the source's aspect ratio (only when the lock is on)
- **Aspect lock toggle** (`Link2` / `Unlink2` icon button between the inputs)
- **9 Social Media Presets**: IG Post (1080²), IG Story (1080×1920), LinkedIn (1200×627), LI Banner (1584×396), WhatsApp (500²), Twitter (1200×675), FB Cover (820×312), YT Thumb (1280×720), Full HD (1920×1080). Clicking a preset writes `{ width, height, selectedPreset: 'ig-post' | ... }`

#### Tab 3 — Format
- 5 format options (WebP ⭐Best, AVIF, JPEG, PNG, Keep Original)
- Each option runs `isFormatSupported('image/...')` against the browser. If unsupported, the button is disabled with a tooltip pointing to the right browser version
- Click writes `outputFormat: 'webp' | 'avif' | 'jpeg' | 'png' | 'original'`

#### Tab 4 — Output (advanced)
- **Rotation**: 0°/90°/180°/270° grid
- **Mirror / Flip** switch
- **Grayscale** switch (uses the BT.601 luma transform: `0.299 R + 0.587 G + 0.114 B`)
- **Strip EXIF Data** switch — **always-on in practice** since `browser-image-compression` always strips metadata by default; the switch is more of a user-facing hint. The switch **does** force a canvas re-encode (see §5.8 logic)
- **Progressive JPEG** switch — **user-facing hint only**; `canvas.toBlob` doesn't expose progressive JPEG encoding
- **Filename pattern** — text input with token inserter (popover with `{name}`, `{ext}`, `{format}`, `{w}`, `{h}`, `{q}`, `{index}`, `{date}`, `{size}` tokens). Live preview shown below the field
- **Reset all settings** button (calls `useSettings.resetAll`)

### 5.6 `ImageQueue` (`src/components/ImageQueue.tsx`)

The file grid + per-file card. Renders nothing if `files.length === 0`. Supports two view modes (`grid` and `list`) via a toggle.

Per-file card shows:
- 56×56 thumbnail (the original `preview` URL, or the `processedPreview` URL once done)
- Status overlays: spinner (processing) / green checkmark (done) / red alert (error)
- Truncated file name (e.g. `very-long-name…JPG` with a smart truncate that preserves the extension)
- Size + dimensions (`originalWidth × originalHeight`)
- Once done: `newSize · ▼ N%` (uses `getCompressionRatio`)
- Once error: red error text (truncated, with full text in `title` for hover)
- A status badge (Ready/Processing/Done/Failed)
- A retry button (RotateCcw) appears when `status === 'error'` and not currently processing
- An inspect (Eye) button that opens `ImageInspector`
- A remove (X) button in the corner, visible on hover or when failed

Above the grid:
- "N files" with "N done" and "N failed" sub-badges
- View mode toggle (grid/list)
- Add (programmatically opens the file input) + Clear (calls `onClearAll`)
- Animated progress bar (gradient + shimmer overlay) when `isProcessing`. Shows `processingText` (e.g. "Processing 3 of 50…") and `progress%` plus ETA from `ProcessingStats` (bytes/s + remaining ms)

Below the grid:
- Single "Compress N images" gradient button (only when `!allDone && readyCount > 0`)

### 5.7 `useImageUpload` hook (`src/hooks/useImageUpload.ts`)

The state machine for the image tool. All UI components call into this hook.

**State:**
```ts
files: UploadedFile[]       // the queue
isProcessing: boolean
progress: number            // 0..100, total across the batch
processingText: string      // human-readable status
currentItem: string | null  // id of the file currently being processed
stats: ProcessingStats      // { bytesPerSecond, etaMs, startedAt, completedBytes }
```

```ts
interface UploadedFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;        // resolved async via getImageDimensions
  originalHeight: number;
  preview: string;              // ObjectURL for the original
  status: 'ready' | 'processing' | 'done' | 'error';
  error?: string;
  result?: ProcessResult;      // { blob, width, height, sizeBytes, reduction, quality, format }
  processedFile?: File;        // = toDownloadFile(...)
  processedPreview?: string;   // ObjectURL for the result
}

interface ProcessingStats {
  bytesPerSecond: number;
  etaMs: number | null;
  startedAt: number;
  completedBytes: number;
}
```

**Limits (from `src/hooks/imageUploadLimits.ts`):**
```ts
export const MAX_FILES = 50;                  // hard cap
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB per file
export const MAX_TOTAL_BATCH_SIZE = 750 * 1024 * 1024; // 750 MB total
export const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10 MB - toasts a "large file" warning
```

**Validation flow (`addFiles`):**
1. Filter to `image/*` types
2. Call `validateBatch(files, currentCount)` from `@/utils/batchValidation` to get a `ValidationReport`:
   - `accepted: number[]` — indices into the input list
   - `overflow: number[]` — dropped due to MAX_FILES
   - `oversized: number[]` — dropped due to MAX_FILE_SIZE
   - `acceptedBytes`, `exceedsTotalCap`
   - `largeFileCount` (>= LARGE_FILE_THRESHOLD)
   - `animatedGifCount` (detected by `image/gif` MIME **or** `.gif` extension, case-insensitive)
3. For each accepted index, generate a UUID, create a `URL.createObjectURL` for the preview, track it in `urlsRef`, and push a new `UploadedFile` with `status: 'ready'`
4. Resolve original dimensions **async** (best-effort, doesn't fail) via `getImageDimensions(item.file)` → `setFiles(prev => ...)`
5. Emit a single batch toast summarizing what happened:
   - `overflow` only → `toast.info("Batch full — added 0 of N files", { description: "Already at 50 images." })`
   - `oversized` only → `toast.warning("Skipped N files over 25 MB")`
   - `largeFileCount > 0` → `toast.info("N large files added — may take longer", { description: "Files over 10 MB can take a while." })`
   - `animatedGifCount > 0` → `toast.info("Animated GIFs become static", { description: "Canvas re-encoding strips the animation." })`
   - mixed → combined toasts

**Object URL lifecycle:**
- `urlsRef = useRef<Set<string>>(new Set())` tracks every ObjectURL we create
- `revokeUrl(url)` removes from the set and calls `URL.revokeObjectURL`
- On unmount, all tracked URLs are revoked

**Methods:**

| Method | Behavior |
|---|---|
| `addFiles(fileList)` | See validation flow above |
| `removeFile(id)` | Revokes both `preview` and `processedPreview` ObjectURLs, removes from queue |
| `retryFile(id, settings)` | Resets status to `ready`, calls `processFiles([id], settings)` |
| `clearAll()` | Revokes every ObjectURL, empties the queue, resets progress + stats |
| `resetFile(id)` | Strips the result/preview, reverts to `ready` (used if you want to re-compress a single file with new settings) |
| `processAll(settings)` | Collects all files with `status === 'ready' | 'error'`, revokes their old `processedPreview` ObjectURLs, then calls `processFiles(ids, settings)` |
| `processFiles(ids, settings)` | The big one — see below |

**`processFiles` flow:**
1. Snapshot the targets via a `setFiles((c) => { targets = c.filter(...); return c; })` trick
2. Yield to React (`await Promise.resolve()`) so any pending status updates can apply first
3. Mark every target's status as `processing`
4. Capture start time + start bytes for the `ProcessingStats` ETA calculation
5. For each target, sequentially:
   - Update `currentItem` and `processingText` (e.g. "Processing 3 of 10 — file.jpg")
   - Call `processImage(item.file, settings, item.originalSize)` (see §5.8)
   - On success: store the `result`, `processedFile` (= `toDownloadFile(name, blob, settings)`), `processedPreview` (= ObjectURL for the blob). Increment `successCount` + `completedBytes`
   - On error: store the `error` message, set status to `error`. Increment `errorCount`
   - Increment completed, update `progress = round(completed/total * 100)`
   - Update ETA: `bytesPerSecond = completedBytes / elapsedSec`, `etaMs = (totalOriginalBytes - completedBytes) / bytesPerSecond * 1000`
6. After the loop, fire a single `toast`:
   - `success === 0` errors → `toast.error('❌ All N images failed')`
   - `success > 0` and `error > 0` → `toast.warning('⚠️ X succeeded, Y failed')`
   - all success → `toast.success('✅ All N images processed successfully!')`

**Derived state (memos):**
- `hasFiles = files.length > 0`
- `allDone = files.length > 0 && files.every(f => f.status === 'done' || f.status === 'error')`
- `processedFiles = files.filter(f => f.status === 'done')`
- `hasErrors = files.some(f => f.status === 'error')`
- `readyCount = files.filter(f => f.status === 'ready' || f.status === 'error').length`

### 5.8 `utils/imageProcessor.ts` — the image engine

This is pure logic; it has no React dependencies. It's the heart of the image tool.

**Exports:**
- Types: `ImageFormat`, `QualityPreset`, `Rotation`, `ProcessSettings`, `ProcessResult`, `FilenameToken`, `FilenameTokenDocs`
- Functions: `formatFileSize`, `getCompressionRatio`, `getImageDimensions`, `toMime`, `toExt`, `isFormatSupported`, `calcDimensions`, `processImage`, `toDownloadFile`, `calculateOptimalQuality`, `estimateQualityForSize`, `getExifOrientation`, `getFilenameTokenDocs`, `applyFilenameTokens`

**`ProcessSettings` shape (mirrors `useSettings`):**
```ts
{
  quality: number;           // 10..100
  autoOptimize: boolean;
  targetSizeKB: number | null;

  width: number | null;
  height: number | null;
  lockAspectRatio: boolean;
  selectedPreset: SocialPresetId | null;

  outputFormat: 'jpeg' | 'png' | 'webp' | 'avif' | 'original';

  stripEXIF: boolean;
  grayscale: boolean;
  rotation: 0 | 90 | 180 | 270;
  mirror: boolean;

  filenamePattern: string;  // e.g. '{name}_q{q}.{ext}'
  qualityPreset: 'max' | 'high' | 'balanced' | 'compact' | 'custom';
}
```

**`processImage(file, settings, originalSize)` algorithm:**

1. Resolve output MIME: `outputMime = toMime(settings.outputFormat, file.type)`
2. Read original dimensions via `getImageDimensions(file)` (creates a temp `Image`, waits for `onload`, reads `naturalWidth/Height`, revokes the ObjectURL)
3. Compute target dimensions and an optional crop rectangle via `calcDimensions(origW, origH, settings.width, settings.height, settings.lockAspectRatio)`
4. Determine if we need the canvas path:
   - `hasTransforms = rotation || mirror || grayscale || stripEXIF`
   - `needsResize = targetW !== origW || targetH !== origH`
   - `needsFormatChange = outputMime !== file.type`
5. Compute the quality to use:
   - If `autoOptimize` → `calculateOptimalQuality(originalSize, targetSizeKB, outputFormat, hasTransforms)`
   - Otherwise → `settings.quality`
6. **If any of hasTransforms / needsResize / needsFormatChange:**
   - Call `canvasProcess(file, targetW, targetH, outputMime, quality, { rotation, mirror, grayscale, crop })`
   - **If `targetSizeKB` is set**, run an iterative loop (max 5 iters, decrement quality by 10 each time, floor at 10) to shrink until the blob fits
7. **Otherwise** (i.e. original format, original dimensions, no transforms):
   - Delegate to `imageCompression(file, { maxSizeMB, maxWidthOrHeight, useWebWorker: true, fileType, initialQuality, alwaysKeepResolution: true })` — fast path that uses Web Workers

**`canvasProcess(source, w, h, mime, quality, options)` (private):**
1. `loadImage(source)` — same as `getImageDimensions` but returns the `Image`
2. Create an offscreen `<canvas>` at the right size. For 90°/270° rotation, swap width/height so the rotated image fits
3. Get a 2D context. Enable `imageSmoothingEnabled = true`, `imageSmoothingQuality = 'high'`
4. If output is JPEG, fill white first (avoids transparency artifacts)
5. If there's a crop, sample only the crop rectangle; otherwise the full image
6. If rotation or mirror is set, translate the origin to the canvas center, then `ctx.scale(-1, 1)` for mirror and/or `ctx.rotate(deg * PI / 180)` for rotation, then draw at the correct offset
7. If grayscale, apply BT.601 luma transform pixel-by-pixel
8. `canvas.toBlob(callback, mime, quality/100)` — quality is clamped to `[0.1, 1]`

**`calcDimensions(origW, origH, targetW, targetH, lock)`** — the social-media-preset-aware dimension math. Returns `{ w, h, crop? }`. This is what the `ImageQueue`'s "no distortion" guarantee relies on.

**`isFormatSupported(mime)`** — feature-detects browser support for a given output MIME by trying `canvas.toDataURL(mime)`. Cached in a `Map<string, boolean>`. Returns `false` if there's no `document` (SSR/test).

**`toMime(format, originalType)`** — for `'original'`, round-trips `image/png|jpeg|webp|avif`; falls back to `image/png` for GIF/BMP/TIFF.

**`toExt(mime)`** — `'image/webp' → '.webp'`, `'image/png' → '.png'`, `'image/avif' → '.avif'`, else `'.jpg'`.

**`toDownloadFile(originalName, blob, settings?)`** — applies the filename token pattern, sanitizes the result via `sanitizeFileName`, sets the right MIME, and returns a `File` named `ls-image-compressor_<base>.<ext>` if no pattern, or the pattern-resolved name.

**`calculateOptimalQuality(originalSize, targetSizeKB, outputFormat, hasTransforms)`:**
- If `targetSizeKB` set:
  - `ratio = targetBytes / originalSize`
  - `ratio >= 0.9 → 95`, `>= 0.7 → 82`, `>= 0.5 → 68`, `>= 0.3 → 50`, else `35`
- Else if `webp` → `hasTransforms ? 80 : 75`
- Else if `avif` → `hasTransforms ? 70 : 65` (AVIF compresses better → lower number)
- Else if `png` → `100` (lossless)
- Else → `80`

**Filename tokens (`getFilenameTokenDocs`, `applyFilenameTokens`):**
- `{name}` — original base name without extension
- `{ext}` — original extension (without leading dot) or the new output extension if changed
- `{format}` — output format lowercase (webp, avif, jpeg, png)
- `{w}` / `{h}` — output width / height in pixels
- `{q}` — quality percentage (0–100)
- `{index}` — file index in the batch (1-based)
- `{date}` — today's date as `YYYY-MM-DD`
- `{size}` — output size in KB (rounded)
- Unknown tokens are left intact in the output

**`getExifOrientation(file)`** — currently a stub returning `1`. The processor doesn't honor EXIF orientation — users must rotate manually. **This is a known limitation worth fixing (see "Suggested Improvements" below).**

### 5.9 `useSettings` hook (`src/hooks/useSettings.ts`)

Owns the entire `Settings` object. Persists to `localStorage['ls-image-compressor-settings']` on every change (try/catch swallows storage errors).

**Default settings:**
```ts
{
  quality: 75,
  autoOptimize: true,
  targetSizeKB: null,

  width: null, height: null, lockAspectRatio: true, selectedPreset: null,

  outputFormat: 'webp',

  stripEXIF: true, grayscale: false, rotation: 0, mirror: false, qualityPreset: 'balanced',

  filenamePattern: '{name}_q{q}.{format}',  // default token-based pattern
}
```

**Methods:**
- `update(partial)` — merges partial
- `resetResize()` — clears width/height/selectedPreset/rotation/mirror
- `applyQualityPreset(preset)` — sets `quality` and `qualityPreset` per a lookup
- `rotateImage(deg)` / `flipImage()` — single-field updates
- `resetAll()` — restores defaults
- `setWidth(value, sourceDims?)` / `setHeight(value, sourceDims?)` — smart updater that calls `computeAspectDimensions(...)` to auto-derive the missing dimension from the source's aspect ratio

**`computeAspectDimensions(origW, origH, targetW, targetH, lock)` (exported):**
- If lock is off or source dims unknown → return as-is
- If width set, height null → `height = round(width / aspect)`
- If height set, width null → `width = round(height * aspect)`
- If both set → return as-is (the processor will then center-crop)

### 5.10 `ResultsSection` (`src/components/ResultsSection.tsx`)

Renders when `allDone && processedFiles.length > 0`. Uses an `IntersectionObserver` to fade in when scrolled into view.

Layout:
- Heading: "🎉 Compression Complete!" with `useCountUp` animated stats bar
  - 3 stat tiles: **N Images / Saved (KB) / % Smaller** — animated count-up from 0 to the target value (cubic-ease-out, ~800ms)
- One card per `done` file, with:
  - "Before" thumbnail (original preview) + size + dimensions
  - Center badge: `▼ 50%` or `▲ 50%` or `— same` (uses `getCompressionRatio`)
  - "After" thumbnail (processed preview) + new size + new dimensions
  - File ext badge + file name (truncated, hover for full)
  - Single "Download" button per file (`saveAs(f.processedFile, f.processedFile.name)`)
  - Clicking either thumbnail opens `ImageInspector`
- **Download All as ZIP** button (gradient, full-width on mobile). If only 1 file, just downloads it directly. ZIP filename: `ls-image-compressor.zip`
- **Process More Images** ghost button — calls `onReset` (= `clearAll`)
- **Share** row: Twitter / X, WhatsApp, Copy Link

**`useCountUp(target, duration = 800)`** — small custom hook that runs a `requestAnimationFrame` loop using `1 - (1-t)^3` easing. Resets when the target changes.

### 5.11 `ImageInspector` (`src/components/ImageInspector.tsx`)

Detailed image view dialog opened by clicking a thumbnail or pressing the eye button. Shown for a single `UploadedFile`.

Layout: full-screen modal with:
- Top: file name + tabs (Comparison / Metadata)
- Body (Comparison tab): reuses `ComparisonView` (see §5.12)
- Body (Metadata tab): EXIF/codec info table — dimensions, MIME, original vs processed size, color profile, last modified
- Right sidebar: settings snapshot + smart recommendation (placeholder for now — wired to `metadata.recommendationReason` if present)
- Bottom: Download button + Close

### 5.12 `ComparisonView` (`src/components/ComparisonView.tsx`) — 649 lines

The big before/after view component. Three sub-modes:
- **Side-by-side**: two `<img>` panels with a 1px gap divider
- **Slider** (default): a vertical line that the user drags left/right to reveal the original vs the compressed version. Two layers — the bottom is the "after" image, the top is clipped via `clipPath: inset(0 ${100-sliderPos}% 0 0)` to reveal the "before" image. Supports pinch / wheel zoom (0.5x–8x), pan (pointer-capture), keyboard nav (arrow keys, `1`/`2`/`3` to switch modes, `+/-/0` to zoom)
- **Toggle**: single image that flips on click or arrow keys

Both the slider and toggle views use a `repeating-conic-gradient` checkerboard background so transparent pixels are visible.

**Zoom math:** the zoom is centered on the cursor — pan offsets are computed as `cx - (cx - pan.x) * (newScale / oldScale)`.

**Keyboard shortcuts:**
- `1` / `2` / `3` → side-by-side / slider / toggle
- `←` / `→` in slider → move by 2 (or 10 with shift)
- `←` / `→` in toggle → flip
- `+` / `-` / `0` → zoom in / out / reset
- `Space` in toggle → flip

Download button is also exposed inline (top-right).

### 5.13 `EmptyState` (`src/components/EmptyState.tsx`)

Tiny reusable component for "no files yet" / "no rules yet" / etc. 37 lines. Centered card with optional icon, title, description, and primary action.

### 5.14 `HowItWorks`, `FeaturesGrid`, `FAQSection`, `TrustBar`, `DocumentTitle`

Landing-page sections, all `IntersectionObserver`-driven fade-ins, no state (except `DocumentTitle` which is a side-effect component).

- **`TrustBar`** — 6-tile card strip ("100% Private / Zero Tracking / Offline-Ready / Open Workflow / Standard Libraries / Any Device")
- **`HowItWorks`** — 3 steps (Upload → Configure → Download) with animated arrow connectors
- **`FeaturesGrid`** — bento 6-card grid using Phosphor icons (ShieldCheck / Lightning / Stack / ArrowsClockwise / Gift / Globe), each with a "Learn more" hover-reveal link
- **`FAQSection`** — 12 Q&A accordion (privacy, formats, PDF, text, batch limits, WebP/AVIF, social presets, rename rules, free/no account, mobile, watermarks)
- **`DocumentTitle`** — see §4.6

### 5.15 `PageDropOverlay` (`src/components/PageDropOverlay.tsx`)

The full-page overlay shown when files are being dragged anywhere on the document (not just inside the upload zone). `z-40` (below the header's `z-50`). Pointer-events disabled — it doesn't intercept the drop, the `usePageDropZone` hook does the actual collection.

### 5.16 `LazySection` (`src/components/LazySection.tsx`)

Generic wrapper that only mounts its `children` when it scrolls within `rootMargin` (default `200px`) of the viewport. Reserves `minHeight` (default 200px) before mounting to prevent layout shift. After intersecting, defers the actual mount to `requestIdleCallback` (1500ms timeout) or `setTimeout(200ms)` fallback, so the main thread stays free for the LCP / first-input path. Renders `<BlockSkeleton />` as placeholder by default; `placeholder={null}` to render an empty `minHeight` div; `placeholder={...}` for custom. Used for all the below-the-fold sections on the home page.

### 5.17 `Skeleton.tsx` (`src/components/Skeleton.tsx`)

Four named exports:
- `RouteSkeleton` — full-page skeleton with header bar, title/subtitle/CTA pulses, plus a "Loading…" line with a Phosphor `Lightning` icon
- `BlockSkeleton({ height })` — single rounded pulse
- `CardSkeleton({ height })` — card-shaped skeleton with avatar + lines
- `QueueSkeleton` — 4 `CardSkeleton`s in a 1/2-column grid (used in `useImageUpload` not-yet-mounted state)

### 5.18 `MobileActionBar` (`src/components/MobileActionBar.tsx`)

Sticky bottom action bar shown only on mobile (`sm:hidden`). Slides up once the user has scrolled past the upload zone. CTA is a full-width gradient button. Local `shouldRender` state delays unmount by 250ms so the slide-out animation completes.

### 5.19 `ScrollToTop` (`src/components/ScrollToTop.tsx`)

Floating back-to-top button. Appears when `window.scrollY > 500`, `z-30`, smooth-scrolls on click. Mounted in `Index.tsx`.

### 5.20 `ErrorBoundary` (`src/components/ErrorBoundary.tsx`)

Class component. `getDerivedStateFromError` sets `hasError`. `componentDidCatch` additionally checks for `ChunkLoadError` / "Loading chunk ... failed" / "Importing a module script failed" to set `chunkError: true` and show a "New version available — Reload" prompt instead of a generic crash. Shows a friendly card with "Try again" or "Go home" + a collapsible "Technical details" panel.

### 5.21 `NavLink` (`src/components/NavLink.tsx`)

Thin `forwardRef` wrapper around `react-router-dom`'s `NavLink` that takes `className`/`activeClassName`/`pendingClassName` and combines them with the `cn()` helper. **Currently not used by any of the main pages** — the header uses raw `<Link>` and `<a>` instead.

### 5.22 `ProfileImage` (`src/components/ProfileImage.tsx`)

Polished portrait/landscape image wrapper used for profile photos. Renders the source image inside a gradient frame, preserves the chosen `aspectRatio` (default `2/3`), lazy-loads, and falls back to gradient initials on error. Supports modern-format `<picture>` sources via the `sources` prop, or a plain `<img>` with `srcSet` / `sizes`. Optional `showStatus` dot. Used in `About.tsx` with the AVIF+WebP `@2x` sources from `src/assets/`.

---

## 6. The PDF Compressor (`/compress-pdf`)

### 6.1 Page: `src/pages/CompressPdf.tsx` (13.6 KB)

Standalone page (lazy-loaded in `App.tsx`). Layout:
```
<Header />
<main>
  <ToolHero tool="pdf" ...>      {/* gradient bg + floating shapes + headline + 4 trust badges */}
    <PdfUploadZone onFilesSelected={addFiles} pdfCount={files.length} />
    {hasFiles && <PdfSettingsPanel {...} />}
    <PdfQueue ... />
  </ToolHero>

  {allDone && processedFiles.length > 0 && <PdfResultsSection files={processedFiles} onReset={clearAll} />}

  <LazySection><TrustBar /></LazySection>
  <LazySection><HowItWorksPdf /></LazySection>     {/* inline component in this file */}
  <LazySection><FeaturesPdf /></LazySection>      {/* inline */}
  <LazySection><FaqPdf /></LazySection>           {/* inline */}
  <Footer />
</main>
<PageDropOverlay visible={isDragging} />
<MobileActionBar visible={...} onCta={...} ctaLabel="Compress" ctaIcon={Lightning} />
<PdfInspector file={...} open={...} onOpenChange={...} onApplyRecommendation={...} onPreviewOne={...} />
<ScrollToTop />
<DocumentTitle {...pageSeo.pdf} />
```

`useClipboardPaste` and `usePageDropZone` are both filtered to only accept PDFs (`f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')`).

The page also has **3 inline components** at the bottom (`HowItWorksPdf`, `FeaturesPdf`, `FaqPdf`) — duplicated copy of the marketing-style steps for PDF.

### 6.2 `PdfUploadZone` (`src/components/PdfUploadZone.tsx`)

Mirror of `UploadZone` but with `accept="application/pdf,.pdf"`, maxFiles=5, maxFile=100 MB, and a Phosphor `FilePdf` icon. Identical animation/keyboard/drag behavior.

### 6.3 `PdfQueue` (`src/components/PdfQueue.tsx`)

Similar to `ImageQueue` but:
- No image preview — uses a 64×64 **first-page thumbnail** (rendered from the PDF on add via `pdfjs.getDocument`), falling back to a `FileText` icon
- Shows the **page count** (resolved async via `getPdfPageCount`)
- Shows a **per-file progress bar** while processing (because each PDF has many pages and we get per-page progress from the processor)
- Renders as a single column (not 2-col grid like images)
- Shows **smart recommendation** chip (Lightbulb icon) when `metadata.recommendationReason` is set; click to apply
- Shows a "Compressing now" badge on the currently active file
- Speed/ETA footer: `bytesPerSecond · ETA` from `ProcessingStats`

### 6.4 `PdfSettingsPanel` (`src/components/PdfSettingsPanel.tsx`)

Simpler than the image version but more featureful:
- **3 preset buttons**: Strong (low, q=0.4) / Balanced (medium, q=0.6) / Light (high, q=0.82) — each with a Phosphor icon (Rocket/Lightning/CheckCircle)
- **JPEG quality slider** 10–95% that maps to the 0..1 JPEG quality range. Editing it switches the preset to `'custom'`
- **Advanced section** with:
  - **DPI** override (72/96/150/300 chip grid; toggle off = auto)
  - **Target size (KB)** numeric input — engine iteratively reduces quality and DPI to fit
  - **Grayscale** switch — saves ~25% on color PDFs
  - **Strip metadata** switch — removes title/author/producer/creator
  - **Page range** — from/to inputs (commits on blur)
  - **Filename pattern** — text input with token inserter (popover with tokens listed in §6.7)
- A small note: "Compression happens entirely in your browser — output PDFs contain re-rendered page images, so text becomes non-selectable."

### 6.5 `PdfResultsSection` (`src/components/PdfResultsSection.tsx`)

Similar to `ResultsSection` but:
- No thumbnails, no comparison view (uses `FileText` icon for each row)
- 3 inline stat tiles: **Total saved / Avg. reduction % / N/M Files** (using the same `useCountUp` hook)
- Each file row: name + size arrow + new size + reduction badge + page count + final quality/DPI
- Per-file **Preview** opens `Dialog` with an `<iframe src={URL.createObjectURL(processedFile)}>` showing the PDF
- Per-file **Save** button (emerald, like image download)
- **Download all as ZIP** button (filename: `ls-image-compressor-pdf.zip`)
- **Start over** ghost button
- Includes a 24-particle monochrome confetti burst that fires when the section scrolls into view

### 6.6 `PdfInspector` (`src/components/PdfInspector.tsx`)

Detailed PDF preview dialog. Layout:
- Top toolbar: file name + page/format/size summary
- Toolbar buttons: show original (placeholder — original preview not available in this tool) / zoom out / zoom in / reset zoom / close
- Body: 2-column on desktop, 1-column on mobile
  - **Left**: `<iframe>` of the processed PDF (with zoom transform), or a placeholder card for original
  - **Right sidebar**: 
    - Compression complete card (if done) — original/optimized/saved/final q
    - Smart recommendation card (if `meta.recommendationReason` set) — `Apply suggestion` button
    - Metadata card — pages, page size, page format, aspect ratio, title, author, file size, PDF version, content type, est. savings
    - "Try current settings" button (if status === 'ready') — runs a one-off compression
    - Download button (if done)
    - Privacy badge — "Output metadata will be stripped on the next run" or "Output will keep an LS Image Compressor producer tag"

### 6.7 `usePdfUpload` hook (`src/hooks/usePdfUpload.ts`)

Mirror of `useImageUpload`, with these differences:
- `MAX_PDF_FILES = 5`, `MAX_PDF_SIZE = 100 * 1024 * 1024`
- `UploadedPdf` has a `progress: number` (0..1) for per-file progress, a `pageCount: number | null` resolved async, and a `metadata?: PdfMetadata` blob (see below)
- `getPdfPageCount(file)` lazy-loads `pdfjs-dist` and configures `GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'`
- `PdfMetadata` shape:
  ```ts
  {
    pageCount: number;
    pageWidth: number; pageHeight: number;          // in points
    estimatedPageSize: 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5' | 'Custom';
    fileVersion?: string;
    title?: string;
    author?: string;
    firstPageThumbnail?: string;                    // data URL
    isTextHeavy: boolean; isImageHeavy: boolean;    // content classification
    recommendedPreset: 'low' | 'medium' | 'high' | 'custom';
    recommendedQuality: number;                     // 0..1
    estimatedSavings: number;                       // 0..100
    recommendationReason: string;                   // human-readable
  }
  ```
- Re-exports `formatBytes`, `getReductionRatio` from `pdfProcessor` for consumers
- Computes ETA via `bytesPerSecond` and `etaMs` like the image hook

### 6.8 `utils/pdfProcessor.ts` — the PDF engine

**Exports:**
- Types: `PdfQualityPreset` (`'low' | 'medium' | 'high' | 'custom'`), `PdfProcessSettings`, `PdfProcessResult`, `PdfMetadata`, `PdfFilenameToken`
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

**`compressPdf(file, settings, onProgress?)` algorithm:**

1. `originalSize = file.size`, start the performance timer
2. Load the source PDF via `pdfjs.getDocument({ data: <copy of the file's ArrayBuffer> })`. **Important:** pdfjs mutates the buffer, so we pass a `slice(0)` copy to keep the original `File` usable for retries
3. Create a new `PDFDocument` via `pdf-lib`, set its `title` / `producer` / `creator` to "LS Image Compressor" (unless `stripMetadata` is on)
4. For each page (1..numPages):
   - `pdf.getPage(i)`
   - `renderPageToJpeg(page, q, scale, maxWidth)`:
     - Compute the base viewport at scale=1
     - If `maxWidth` is set and the page is wider, downgrade `scale` to `max(0.1, maxWidth / baseWidth)`
     - Create a canvas at the right size
     - Fill white first (PDFs with transparency would otherwise go black in JPEG)
     - `page.render({ canvasContext, viewport, canvas }).promise` — this is the actual rasterization
     - `canvas.toBlob(b, 'image/jpeg', q)` → get the bytes
   - `outDoc.embedJpg(bytes)` → get an image
   - `outDoc.addPage([w, h])` → add a page the size of the image
   - `newPage.drawImage(jpeg, { x:0, y:0, width, height })`
   - `page.cleanup()` (free the source page)
   - `onProgress?.(i / totalPages, i, totalPages)`
   - **Yield to the event loop every 3 pages** (`await new Promise(r => setTimeout(r, 0))`) so the UI stays responsive on big PDFs
5. `pdf.cleanup()` to free the source
6. `outDoc.save({ useObjectStreams: true })` → returns a `Uint8Array`
7. Wrap in a `Blob([u8], { type: 'application/pdf' })`
8. Compute `reduction = round((original - new) / original * 100)`, clamped to ≥ 0
9. Return `{ blob, pageCount, sizeBytes, reduction, quality, scale, durationMs, finalQuality, finalDpi }`

**Target-size iteration** (`compressPdfForPreview`): when `settings.targetSizeKB` is set, run the loop with `q=quality, dpi=auto` then decrement both (q −0.1, dpi 0.9×) up to 5 times until the output fits. Returns the first matching iteration.

**Smart recommendation** (`extractPdfMetadata`):
- Reads page size and classifies as A4/Letter/Legal/A3/A5/Custom
- Heuristic: scans the first page bitmap for variance — high variance = image-heavy, low variance + lots of small distinct regions = text-heavy
- Estimates savings based on the content classification + DPI/page-size
- Returns the recommendation string ("Text-heavy PDF — use Light preset to keep readability") + recommended preset/quality

**Filename tokens (`getPdfFilenameTokenDocs` / `applyPdfFilenameTokens`):**
- `{name}` — original base name without extension
- `{ext}` — always `pdf` for the output
- `{format}` — always `pdf`
- `{pages}` — total page count
- `{size}` — output size in KB
- `{date}` — today's date as `YYYY-MM-DD`
- `{q}` — quality percentage (0–100)
- `{index}` — file index in the batch (1-based)

**`toDownloadPdfFile(originalName, blob, settings?)`** — applies the filename pattern, sanitizes, sets MIME `application/pdf`.

**Important caveat (documented in `CompressPdf.tsx` FAQ):** After compression, **text is no longer selectable** — the pages are now full-page JPEG images. This is a known limitation of the "rasterize & re-save" approach. A more sophisticated pipeline could keep text layers intact, but that's not the current implementation.

### 6.9 `utils/pdfFormat.ts` (3.9 KB)

Small module that exports `PDF_QUALITY_PRESETS` and a few pure helpers. The presets are:
```ts
{ low:    { quality: 0.4,  scale: 1.25, maxWidth: 1100 } }
{ medium: { quality: 0.6,  scale: 1.75, maxWidth: 1700 } }
{ high:   { quality: 0.82, scale: 2.25, maxWidth: 2400 } }
```
Plus the filename-token docs that mirror `pdfProcessor.getPdfFilenameTokenDocs` for use in the panel UI.

---

## 7. The Bulk Renamer (`/bulk-rename`)

### 7.1 Page: `src/pages/BulkRename.tsx` (12.2 KB)

Layout mirrors the PDF page (its own hero, inline HowItWorks/Features/FAQ sections, PageDropOverlay). State is owned by `useFileRename()`.

```
<Header />
<main>
  <ToolHero tool="rename" ...>
    <FileRenameUploadZone onFilesSelected={addFiles} fileCount={files.length} />
    {files.length > 0 && <FileRenameRuleBuilder rules={rules} onAdd={addRule} onUpdate={updateRule} onRemove={removeRule} onMove={moveRule} onReset={resetRules} />}
    <FileRenamePreviewList ... />
  </ToolHero>

  {files.length > 0 && <StatsRow plan={plan} totalSize={totalSize} formatBytes={formatBytes} />}

  <LazySection><HowItWorksRename /></LazySection>
  <LazySection><FeaturesRename /></LazySection>
  <LazySection><FaqRename /></LazySection>
  <Footer />
</main>
<PageDropOverlay visible={isDragging} />
<MobileActionBar visible={...} onCta={...} ctaLabel="Download" ctaIcon={Download} />
<ScrollToTop />
<DocumentTitle {...pageSeo.rename} />
```

The inline `StatsRow` is a 3-tile summary: **Files / Will rename / Total size**.

### 7.2 `FileRenameUploadZone` (`src/components/FileRenameUploadZone.tsx`)

Identical to the image upload zone but `accept` is unset (any file type), `maxFiles = 100`, max size 200 MB, uses a Phosphor `FilePlus` icon, no "Ctrl V" hint.

### 7.3 `FileRenameRuleBuilder` (`src/components/FileRenameRuleBuilder.tsx`) — 845 lines

The biggest single component. Lets the user:
- Click **Add rule** → expands a grid of 13 addable rule types
- For each rule in the list, see:
  - A drag-handle-style numbered badge
  - A label like "Find & Replace" / "Add Prefix" / "Numbering" / ...
  - Up/Down/Trash buttons (up/down disabled at the boundaries)
  - A `RuleEditor` sub-component with form fields specific to that rule kind

**The 13 rule kinds and their editors:**

| Kind | Editor fields | Notes |
|---|---|---|
| `replace` | `find`, `replace` text inputs + checkboxes for Regex + Case-insensitive | Empty `find` → no-op; invalid regex → no-op (doesn't throw) |
| `prefix` | single text input | Empty text → no-op |
| `suffix` | single text input | Empty text → no-op |
| `numbering` | `position` (start/end), `separator`, `start` (number), `pad` (0..10) | Disabled if `enabled: false` |
| `case` | 4 toggle buttons: lower / UPPER / Title / Sentence | |
| `whitespace` | 4 toggle buttons: a-b / a_b / ab / a b | `remove` collapses multiple spaces |
| `removeChars` | single text input ("Characters to strip") | Regex-escapes the input set |
| `date` | `format` (7 options) + `separator` + position (Prefix/Suffix) + "Now" checkbox | Uses `lastModified` (or `useCurrent: true` → `new Date()`) |
| `insertAt` | `index` (number, negatives count from end) + `text` | `-1` appends, `-2` inserts before last char |
| `trim` | mode (Trim Start / Trim End / Trim Both / Truncate) + count or maxLength + ellipsis checkbox | |
| `replaceExt` | mode (Set / lower / UPPER / None) + extension text input (only when Set) | |
| `extractCounter` | `where` (first/last) + `position` (start/end) + separator + pad + fallbackStart | Falls back to `fallbackStart` if no digits in original name |
| `reverse` | (no fields — just a description) | |

A factory for each kind is defined in `addableRuleTypes` array so the "Add rule" panel can drop in a sensible default.

### 7.4 `FileRenamePreviewList` (`src/components/FileRenamePreviewList.tsx`)

The live preview. As soon as files or rules change, `useFileRename` recomputes the plan via `buildRenamePlan(...)`, and this list re-renders.

Per file:
- Old name (struck through, muted) + new name (highlighted changes)
- `highlightDiff(original, renamed)` — a cheap greedy diff: finds the common prefix and common suffix, wraps the middle in a primary-colored pill (`<span class="rounded bg-primary/15 px-0.5 font-semibold text-primary">`)
- Size + file type chip
- Remove (X) button on hover

Header:
- "N files · X renamed · Y total" badges
- Add + Clear buttons

Below:
- Animated progress bar + "Building ZIP… NN%" while zipping
- "Clear rules" + "Download renamed ZIP" gradient button

### 7.5 `useFileRename` hook (`src/hooks/useFileRename.ts`)

**State:**
```ts
files: RenameFile[]              // { id, file, name, size, type }
rules: RenameRule[]
isZipping: boolean
zipProgress: number              // 0..100
```

**Constants:** `MAX_RENAME_FILES = 100`, `MAX_RENAME_SIZE = 200 * 1024 * 1024`.

**Memoized plan:**
```ts
const plan = useMemo(() => buildRenamePlan({
  files: files.map(f => ({ id: f.id, name: f.name, lastModified: f.file.lastModified })),
  rules,
}), [files, rules]);

const changedCount = useMemo(() => plan.filter(p => p.changed).length, [plan]);
const totalSize = useMemo(() => files.reduce((s, f) => s + f.size, 0), [files]);
```

**Methods:**
- `addFiles(list)` — filters to size ≤ 200 MB, caps at 100, generates UUIDs
- `removeFile(id)`, `clearAll()`
- `setRules(next)`, `addRule(rule)`, `updateRule(index, patch)`, `removeRule(index)`, `moveRule(index, dir)`, `resetRules()`
- `downloadZip()` — see below
- `formatBytes(n)` — local helper (also exported)

**`downloadZip()` flow:**
1. If `files.length === 0` → toast.info and bail
2. Set `isZipping = true`, reset `zipProgress`
3. Create `new JSZip()`, get its `'renamed'` subfolder (fall back to root if `.folder()` returns null)
4. For each file: add `folder.file(sanitizeFileName(plan[i].renamedName ?? f.name), f.file)`. Update `setZipProgress(round((i+1)/files.length * 90))` — first 90% of the bar is "adding files"
5. `zip.generateAsync({ type: 'blob', compression: 'STORE' }, (meta) => setZipProgress(90 + meta.percent / 10))` — last 10% of the bar is "compressing". **`STORE` is used on purpose** — files are already compressed; using `DEFLATE` would waste CPU for almost no size benefit
6. `saveAs(blob, 'ls-image-compressor-rename.zip')` — triggers download
7. `setZipProgress(100)` + `toast.success('✅ Renamed N of M files. ZIP downloaded.')`
8. In `finally`, after 400ms, clear `isZipping` and reset `zipProgress`

### 7.6 `utils/fileRenamer.ts` — pure rule engine

**Exports:**
- Types: `RenameRule` (union of 13 kinds), `CaseMode`, `ReplaceMode`, `WhitespaceMode`, `DateFormat`, `TrimMode`, `ExtMode`, `CounterWhere`, `RenamePlanEntry`, `BuildPlanInput`, `RenameContext`
- Constants: `DEFAULT_RULES = []`
- Functions: `splitExtension`, `renameBase`, `buildRenamePlan`, `sanitizeFileName`

**`splitExtension(name)`:**
- Finds the last `.`
- If `dot <= 0` (no dot or leading dot like `.gitignore`) or `dot === name.length - 1` (trailing dot like `weird.`) → return `{ base: name, ext: '' }`
- Otherwise → `{ base: name.slice(0, dot), ext: name.slice(dot) }`

**`renameBase(base, rules, index, total, context?)`:**
- Iterates `rules` in order
- For each `rule.kind`, dispatches to the appropriate `apply*` helper
- `replaceExt` is a no-op here — extension rules are run in a separate pass
- `context.originalBase` is the *original* base name (so `extractCounter` can read digits from the pre-transform name)
- `context.lastModified` is for the `date` rule

**`buildRenamePlan({ files, rules })`:**
1. Split rules into `baseRules` and `extRules` (preserves order)
2. For each file, split the name → rename the base → apply extension rules
3. **De-duplicate** by lowercased name: if the candidate name has been seen before, append ` (2)`, ` (3)`, etc. (also `splitExtension` to make sure the counter goes between base and ext)
4. Return entries with `{ id, originalName, renamedName, changed: (renamedName !== originalName) }`

**`sanitizeFileName(name)` — the OS-safety net:**
- Strips characters illegal on Windows/macOS/Linux: `< > : " / \ | ? *` and control chars (`\x00-\x1f`) → replaced with `_`
- Collapses runs of underscores
- Trims leading/trailing whitespace and dots
- Caps at 200 characters
- Falls back to `'untitled'` if everything is stripped

---

## 8. Marketing Pages

### 8.1 `About.tsx` (70 KB, 1687 lines)

Full story page. Sections:
- **Hero** — badge "OUR STORY" + gradient headline "Built in India, for the world" + subhead + 2 CTAs (Explore tools / GitHub)
- **Stats** — 4 animated count-up tiles: 25K+ Active Users, 99.7% Uptime, 4.9/5 Rating, 100% Open Source
- **Pillars** — 3 cards: Our Mission, Our Vision, Our Story (Girish Lade weekend project origin in 2024)
- **Journey timeline** — chronological milestones (2024 Q3 → 2026 Q1)
- **Philosophy** — 4 cards on the local-first ethos
- **Values** — 6 cards: Privacy First, Open Source, User Respect, Sustainable Growth, Quality Engineering, Community
- **Tech stack** — 4 cards: Engines, Foundation, Tooling, Distribution
- **Built for** — 4 audience cards: Developers, Designers, Content Creators, Small Business
- **Profile section** — 2-column with `<ProfileImage>` (the 4-variant AVIF/WebP image) + bio + skills chips + 4 social links (GitHub/LinkedIn/Instagram/Email)
- **CTA** — "Try the tools" back to home

Uses an inline `useCountUp` hook (1200ms duration), inline `formatCompact` helper, framer-motion `useInView` for each section, and a constant `SECTION_DIVIDER` for the thin gradient line between sections.

### 8.2 `Contact.tsx` (35 KB)

Multi-section contact page with channels (email, GitHub, LinkedIn, Instagram), FAQ-style "Common questions", map placeholder, and a "Response time" card. Uses Phosphor icons throughout.

### 8.3 `PrivacyPolicy.tsx`, `TermsOfService.tsx` (8 KB each)

Long-form legal pages with table of contents, numbered sections, and signature line. Last updated March 8, 2026. Both use `DocumentTitle` with their respective `pageSeo.privacy` / `pageSeo.terms`.

### 8.4 `NotFound.tsx` (4.5 KB)

404 page with motion. Big "404" gradient headline, "Page not found" subhead, "Back to home" button (uses `<Link to="/">`).

---

## 9. Shared Page-Behavior Hooks

### 9.1 `useClipboardPaste({ onPaste, enabled = true, accept = 'all' })` — `src/hooks/useClipboardPaste.ts`

Document-level `paste` listener:
- If `enabled` is false, no-op
- Reads `e.clipboardData.items`, filters to `kind === 'file'`
- `accept = 'image'` filters to `type.startsWith('image/')`; `accept = 'pdf'` filters to `application/pdf` or `.pdf`; `'all'` accepts everything
- Skips pastes whose target is an `<input>`, `<textarea>`, or any `contentEditable` element (so users can still paste text into form fields)
- If any files are found → `e.preventDefault()` and `onPaste(files)`

### 9.2 `usePageDropZone({ onDrop, enabled = true, accept = 'all' })` — `src/hooks/usePageDropZone.ts`

Document-level drag-and-drop tracker:
- Uses a `depth` counter (dragenter increments, dragleave decrements) so the `isDragging` state only goes false when the cursor truly leaves the document
- `hasFiles(e)` checks `e.dataTransfer.types` contains `'Files'` (so the overlay only appears for actual file drags, not text/link drags)
- On `dragover`: `e.preventDefault()` and set `dropEffect = 'copy'`
- On `drop`: `e.preventDefault()`, reset `depth`, reset `isDragging`, and call `onDrop(Array.from(e.dataTransfer.files))`
- Same `accept` filter as `useClipboardPaste`

### 9.3 `useIsMobile()` — `src/hooks/use-mobile.tsx`

Detects viewport `< 768px` via `window.matchMedia('(max-width: 767px)')` + a manual check. Returns `boolean`.

### 9.4 `useToast` + `use-toast.ts` — Radix toast state machine

The classic shadcn-style toast reducer. `TOAST_LIMIT = 1` (only one toast at a time), `TOAST_REMOVE_DELAY = 1_000_000` (effectively never auto-removed). Exposes `toast({...})` and `useToast()`. The actual rendering lives in `components/ui/toaster.tsx`. **In practice, the app uses `sonner` (`toast.success` etc.) for all user notifications — `useToast` is wired but only used by the legacy `<Toaster />` mount in `App.tsx`**.

### 9.5 `imageUploadLimits.ts` — `src/hooks/imageUploadLimits.ts`

Pure constants re-exported from `@/utils/batchValidation`:
```ts
export { MAX_FILES, MAX_FILE_SIZE, MAX_TOTAL_BATCH_SIZE, LARGE_FILE_THRESHOLD } from '@/utils/batchValidation';
```
Consumed by `useImageUpload` so the limits are documented in one place.

---

## 10. Shared UI Components

### 10.1 `Header` (`src/components/Header.tsx`)

- Fixed at the top, `z-50`, with `backdrop-blur-xl` background
- Gradient line (`h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent`) at the top edge
- Logo: ⚡ emoji in a tinted rounded square + "LS Image Compressor" gradient text
- Desktop nav (`hidden md:flex`): How It Works / Features / FAQ (smooth-scroll anchors on `/`) + Compress PDF / Bulk Rename (`<Link to=...>`) + dark/light toggle
- Mobile nav: dark/light toggle + hamburger. Tapping the hamburger opens a full-screen slide-in panel (right side, `max-w-xs`) with all the same links plus About / Privacy / Terms / Contact
- **Mobile menu accessibility:** body scroll is locked while open, Escape key closes it, first link is focused 50ms after open
- **Prefetch on hover** — desktop nav links use `usePrefetchOnHover` (see §15) to warm the lazy chunks
- Scroll detection: a `scrolled` state adds a shadow + bottom border when `window.scrollY > 20`

### 10.2 `Footer` (`src/components/Footer.tsx`)

- 4-column grid on desktop (logo+blurb, Product, Company, Legal), single-column on mobile
- 6 social icons (Instagram, LinkedIn, GitHub, CodePen, Mail, Website)
- `handleAnchorClick` only smooth-scrolls when on `/` (else falls through to default `<a href="#...">` behavior)
- Copyright: `© 2026 LS Image Compressor. All rights reserved.`

### 10.3 `lib/motion.ts` — Shared framer-motion variants

Reusable `easeOutExpo` cubic-bezier, `easeOut`, `fadeInUp`, `fadeIn`, `scaleIn`, `staggerContainer`, `floatBlob`, `accordionVariants`, `pulseGlow`, `shimmer`, `gradientPan`, `cardHover`, `cardTap`, `buttonHover`, `buttonTap`, `iconHover`, `arrowHover`. Imported by sections like `FAQSection` and `Index` to keep timing consistent.

### 10.4 The `ui/` folder (shadcn/ui primitives)

49 components. **Actively used in the app:**
- `button`, `input`, `label`, `slider`, `switch`, `tabs`, `tooltip`, `dialog`, `sonner`, `toast`, `toaster`, `badge`, `accordion`, `popover` (heavily used in `PdfSettingsPanel`), `select` (imported but not used in the pages I read), `card` (imported but not used), `checkbox` (used in the rename rule builder's regex/case toggles)

**Installed but unused** (can probably be deleted to slim the install): `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `breadcrumb`, `calendar`, `carousel`, `chart`, `collapsible`, `command`, `context-menu`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input-otp`, `menubar`, `navigation-menu`, `pagination`, `progress`, `radio-group`, `resizable`, `scroll-area`, `separator`, `sheet`, `sidebar`, `skeleton`, `table`, `textarea`, `toggle`, `toggle-group`

> The `use-toast.ts` in `src/hooks/` is the actual one used; the copy in `src/components/ui/use-toast.ts` is identical boilerplate from the shadcn starter and could be removed.

---

## 11. Performance Primitives

### 11.1 `src/lib/prefetch.ts`

Two utilities for non-blocking chunk loading:

```ts
usePrefetchOnHover(href: string, options?: { timeout?: number }): {
  onMouseEnter, onFocus, onTouchStart
}

prefetchOnIdle(loader: () => Promise<unknown>, timeout = 1500): void
```

- `usePrefetchOnHover` returns pointer/focus/touch handlers that call `import(/* @vite-ignore */ href)` on first interaction. Used in the Header nav so the lazy route chunks are warm by the time the user clicks.
- `prefetchOnIdle` schedules a single `requestIdleCallback` (1500ms timeout) — falls back to `setTimeout(200ms)`. Used in `VercelAnalytics.tsx` to defer analytics.

### 11.2 Code-splitting (from `vite.config.ts`)

Manual chunks:
- `vendor-pdf` — `pdfjs-dist` + `pdf-lib` (loaded only on `/compress-pdf`)
- `vendor-zip` — `jszip` + `file-saver` (loaded only on `/bulk-rename` and the results-section ZIP paths)
- `vendor-image` — `browser-image-compression` (loaded on the image tool's fast path)
- `vendor-react` — `react`, `react-dom`, `react-router-dom`
- `vendor-motion` — `framer-motion`

The image-compression library uses Web Workers internally (`useWebWorker: true`), so the heavy work happens off the main thread.

---

## 12. State Management — The Big Picture

The app has **no global state store** (no Redux, no Zustand, no Jotai). All state is local React state inside the page-level hooks. The data flow is:

```
                          ┌──────────────────┐
   user drags / pastes ──▶│   useClipboard   │
   user picks file     ──▶│   usePageDrop    │──┐
                          └──────────────────┘  │
                                                 ▼
                                    ┌──────────────────────┐
                                    │   Page-level hook    │
                                    │ (useImageUpload,     │
                                    │  usePdfUpload, or    │
                                    │  useFileRename)      │
                                    │                      │
                                    │ files[] + UI state   │
                                    │ + processing state   │
                                    │ + ProcessingStats    │
                                    └─────────┬────────────┘
                                              │
                                              ▼
                                    ┌──────────────────────┐
                                    │   utility engine     │
                                    │ (imageProcessor,     │
                                    │  pdfProcessor, or    │
                                    │  fileRenamer)        │
                                    └─────────┬────────────┘
                                              │
                                              ▼
                                    ┌──────────────────────┐
                                    │   Pure Blob/Buffer   │
                                    │   (then saveAs)      │
                                    └──────────────────────┘
```

- **`useSettings`** is separate — it persists across navigations via `localStorage`, and is only consumed by the home page (PDF and Rename pages manage their own per-tool state).
- **`ThemeContext`** is the only true app-wide context (dark/light mode).
- **`QueryClient`** is **no longer mounted** in `App.tsx` (was in the previous version, removed). `@tanstack/react-query` is still installed but unused.

---

## 13. Theme System (CSS Variables)

Defined in `src/index.css`:

```css
:root {
  --background: 0 0% 100%;            /* pure white */
  --foreground: 0 0% 9%;              /* near-black */
  --card: 0 0% 100%;
  --card-foreground: 0 0% 9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 9%;
  --primary: 0 0% 9%;                 /* pure-ish black */
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96%;
  --secondary-foreground: 0 0% 15%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
  --accent: 0 0% 15%;                 /* near-black */
  --accent-foreground: 0 0% 98%;
  --destructive: 0 75% 50%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 90%;
  --input: 0 0% 90%;
  --ring: 0 0% 9%;
  --radius: 0.625rem;
  /* Legacy aliases remapped to greyscale: */
  --indigo: 0 0% 9%;
  --teal: 0 0% 15%;
  --violet: 0 0% 9%;
  --cyan: 0 0% 15%;
  --brand: 0 0% 9%;
  --brand-2: 0 0% 15%;
  --slate: 0 0% 50%;
  --success: 158 50% 35%;
  --warning: 38 90% 50%;
  --info: 210 80% 50%;
  --sidebar-*: ...                    /* sidebar vars */
}

.dark {
  --background: 0 0% 6%;
  --foreground: 0 0% 96%;
  --primary: 0 0% 96%;
  --primary-foreground: 0 0% 6%;
  --accent: 0 0% 88%;
  --border: 0 0% 14%;
  /* ... */
}
```

**Usage convention:** Components use `hsl(var(--primary))`, `hsl(var(--accent))`, `hsl(var(--destructive))`, etc. — and many inline `style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}` for the signature gradient buttons (now both endpoints are greyscale but the gradient still adds depth).

**Custom Tailwind utilities** in `src/index.css`:
- `.glass-card` — blurred translucent card
- `.gradient-text` / `.gradient-bg` / `.gradient-border` — the brand gradient
- `.animate-float`, `.animate-scale-in`, `.animate-fade-in-up`, `.animate-pulse-glow`, `.shimmer-gradient`, `.animate-shimmer` — custom animations
- `.glass-morphism` — frosted glass effect (light + dark variants)
- `.safe-bottom` — `padding-bottom: env(safe-area-inset-bottom)` for iPhone home-bar
- `.shadow-elev-1`, `.shadow-elev-2`, `.shadow-elev-3` — themed elevation shadows

**Custom Tailwind keyframes** in `tailwind.config.ts`:
- `accordion-down` / `accordion-up` — Radix accordion height transitions
- `pulse-glow` — box-shadow pulse
- `fade-in-up` — opacity + translateY(24px → 0)
- `shimmer` — translateX(-100% → 100%) for the progress-bar shimmer overlay

**`inter` font:** loaded from Google Fonts in `index.html` (preconnect + stylesheet link). `body { font-family: 'Inter', sans-serif; }` in `index.css`.

---

## 14. SEO, Metadata, Structured Data

### 14.1 `index.html` (root-level defaults)

- **Inline pre-mount theme script** — sets `dark` class on `<html>` *before* React mounts, based on `localStorage` to avoid FOUC
- **Title & meta description** — keyword-rich
- **Author / owner / copyright** — all point to "Lade Stack"
- **Robots meta** — `index, follow, max-image-preview:large, ...` for the main page
- **Geotagging** — `IN / India`
- **Mobile / PWA** — `theme-color`, `apple-mobile-web-app-capable`, viewport-fit, etc.
- **Canonical** — `https://img.ladestack.in/`
- **Favicons** — inline data-URI SVG with the ⚡ emoji, plus standalone files in `public/`
- **Open Graph + Twitter** — full set
- **JSON-LD structured data** — WebApplication + Organization + others

### 14.2 `src/config/seo.ts` (per-page)

The actual per-page metadata lives in `src/config/seo.ts` and is injected by `DocumentTitle` at runtime. Each page passes its own `pageSeo.X` object to `<DocumentTitle {...pageSeo.X} />` (or builds the call inline). This keeps `index.html` small and gives every route its own:
- `title`, `description`, `keywords`
- `ogImage` (one of the 6 dedicated PNG/SVGs in `public/`)
- `jsonLd` blocks (WebApplication, FAQPage, BreadcrumbList, Organization, Article variants)

The 8 pages registered: `home`, `pdf`, `rename`, `about`, `contact`, `privacy`, `terms`, `notFound`.

### 14.3 `public/robots.txt` (7 KB)

Extensive bot directives for major crawlers with explicit allow/disallow rules per directory and per bot.

### 14.4 `public/sitemap.xml`, `sitemap-index.xml`, `image-sitemap.xml`

Standard XML sitemaps. `image-sitemap.xml` includes the profile photos used on the About page so Google Images can index them.

---

## 15. Deployment (`vercel.json`)

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }   // SPA fallback
  ],
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

- SPA rewrites: every path falls through to `index.html`
- Hashed assets under `/assets/*` get a 1-year immutable cache
- Every response gets the standard security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy blocking camera/mic/geo/FLoC)
- Vercel Analytics + Speed Insights loaded via `VercelAnalytics.tsx` at idle, only in production

---

## 16. PWA / Offline / Service Worker

**None.** No `manifest.json`, no service worker, no `vite-plugin-pwa`. The site is a plain SPA. Could be a worthwhile addition.

---

## 17. Testing

Vitest is configured (jsdom + `@testing-library/jest-dom` + setup file at `src/test/setup.ts`):
- `src/test/setup.ts` — `matchMedia` polyfill + jest-dom import
- `src/test/batchValidation.test.ts` — 12 unit tests covering the limits, the validation report shape, GIF detection, total-size cap, FIFO ordering, and boundary conditions

**Hooks are NOT tested.** `useImageUpload`, `usePdfUpload`, `useFileRename`, `useSettings` have no test coverage.
**Components are NOT tested.** Only pure utility functions are tested.
**Pages are NOT tested.**

The `vitest.config.ts` uses `globals: true`, so `describe` / `it` / `expect` are globally available. Run with `npm test` or `bun test`.

---

## 18. Known Tech Debt & Quirks (to be aware of before changing things)

1. **`QueryClientProvider` was removed from `App.tsx`** but `@tanstack/react-query` is still in `package.json`. Drop the dep or wire it in for future server-backed features.
2. **`@tanstack/react-query` provider removed** but `useQuery`/`useMutation` is unused — safe to drop.
3. **`utils/batchValidation.ts` is wired into `useImageUpload.addFiles`** (via `validateBatch`) — no longer a dead module. The constants are re-exported from `hooks/imageUploadLimits.ts`.
4. **`src/hooks/use-toast.ts` and `src/components/ui/use-toast.ts` are duplicates.** The latter is the shadcn boilerplate; the former is the actually-imported one.
5. **`browser-image-compression` Web Worker path** is enabled in the fast path, but the `useWebWorker: true` option requires the worker to be available. If the bundler ever fails to include it, the engine would silently fall back to the main thread.
6. **`processImage` always strips EXIF** when going through the canvas path (since canvas re-encoding loses it). When using the `browser-image-compression` fast path, it also strips by default. The `stripEXIF` setting only forces the canvas path — there's no `preserveMetadata: true` implementation. The settings in the panel (`progressive`, `embedColorProfile`, `preserveMetadata`) are **no longer in the settings type** (they were removed) — only `filenamePattern` remains as a real advanced toggle.
7. **`getExifOrientation` is a stub** returning `1`. EXIF orientation is ignored. iPhone photos taken in portrait may come out rotated incorrectly. A real fix would parse the EXIF block and pass an orientation to the canvas transform.
8. **`progressive` toggle in the image settings is gone** (removed from `useSettings`). The `SettingsPanel` no longer has a "Progressive JPEG" switch.
9. **Social preset lists are inconsistent** between `SettingsPanel` (9 presets) and the old `SocialPresetsGrid` (which is no longer in the codebase — the section under the hero was removed).
10. **PDF compression loses text layer** — every page becomes a full-page JPEG image, so text isn't selectable / searchable. The FAQ honestly documents this.
11. **PDF page count + metadata is read on every drop** — `getPdfPageCount` + `extractPdfMetadata` lazy-load pdfjs and re-parse the first page to render a thumbnail every time `addFiles` is called. The lazy-load is cached at module level, but for a single batch the second call still does an unnecessary `getDocument` cycle. Not a perf issue in practice, just verbose.
12. **Error boundary exists** at the route level — catches rendering errors + detects `ChunkLoadError` for stale-cache recovery.
13. **CSP** — there's no `Content-Security-Policy` meta tag. Vercel `Permissions-Policy` blocks camera/mic/geo but a stricter CSP would still help.
14. **`<title>` is set per-route** via `DocumentTitle` for all 8 pages — the SEO miss from the previous version is fixed.
15. **Analytics is Vercel-only** — Analytics + Speed Insights, idle-loaded. No Sentry or PostHog for crash visibility.
16. **Mobile menu accessibility** is decent. The `Suspense` fallback for the route bundle is a `RouteSkeleton` (pulsing placeholder), not a blank div.

---

## 19. Suggested Improvements (great AI-assist targets)

These are concrete, well-scoped improvements that the current architecture already supports:

### 19.1 Image tool
- **Honor EXIF orientation.** Implement `getExifOrientation` properly (read the EXIF block from the file, find tag `0x0112`, value 1..8). Pass the result into `canvasProcess` and add a rotation step at the start.
- **Add a true "target KB" iterative loop visualization** — currently the loop runs but there's no per-attempt feedback. Could show "Trying 80%… Trying 70%… 245 KB ✓".
- **Add HEIC input support** (the Settings panel already mentions Safari 16+ for AVIF — HEIC is also a useful input format). Use `heic2any` for decoding.
- **Add WebP animation** — currently animated GIFs are mentioned in a toast that says they become static. You could re-encode to animated WebP using `canvas.toBlob('image/webp')` on a sequence of frames.
- **Re-introduce `progressive`, `embedColorProfile`, `preserveMetadata` honestly** — either wire them in or remove them entirely (they're already removed from the type, so this is just about not advertising fake features).

### 19.2 PDF tool
- **Smarter page detection.** Currently every page is re-rendered at the same `scale`/`quality`. Image-heavy pages (scans) tolerate much lower quality than text-heavy pages. You could detect "this page is mostly text" and skip re-encoding, or use higher quality for text pages. A naive version: classify by running an edge detector on the rasterized bitmap. (The smart-recommendation infrastructure is already in place via `extractPdfMetadata`.)
- **Preserve text layer where possible.** Use `pdf-lib` to *modify* the original PDF instead of re-encoding — strip duplicate embedded images, recompress image streams with lower quality. This is the "qpdf -linearize" approach.
- **Allow per-page range selection** is already implemented (`pageRange` setting) — expose per-page range variations (e.g. skip cover/blank pages).

### 19.3 Renamer
- **Per-rule live preview on hover** (currently the whole list re-renders).
- **Save/load rule presets** to `localStorage` so power users don't rebuild the same pipeline.
- **Regex tester / cheatsheet** inline (the `find` field for a regex rule is just a text input — a tester would be valuable).
- **Drag-to-reorder rules** (currently only up/down buttons).

### 19.4 Cross-cutting
- **PWA / service worker / manifest** — none currently. Would enable install + offline.
- **i18n** — the entire UI is in English, but the search rankings clearly target a global audience. Consider `react-i18next`.
- **Internationalize the format helpers** — `formatFileSize` could use `Intl.NumberFormat` for locale-aware number formatting.
- **Tighten the unused shadcn deps.** Remove the 30+ unused `ui/*` files and their corresponding `@radix-ui/*` deps to slim the bundle by hundreds of KB.
- **Add `aria-live` regions** for the processing state and progress percentage (the `ImageQueue` already has one for the overall progress bar; consider adding it to per-file progress).
- **Remove `@tanstack/react-query`** since it's no longer mounted in `App.tsx`.

---

## 20. How to Add a New Tool (e.g. Video Compressor)

Following the existing pattern:

1. **Add the route** in `src/App.tsx`:
   ```tsx
   const VideoCompress = lazy(() => import("./pages/VideoCompress"));
   // ...
   <Route path="/compress-video" element={<VideoCompress />} />
   ```
2. **Create `src/pages/VideoCompress.tsx`** — copy the structure of `CompressPdf.tsx` (gradient hero, badges, upload zone in the middle, queue, settings, results, inline `HowItWorks` / `Features` / `FAQ`).
3. **Create `src/utils/videoProcessor.ts`** — pure logic. Mirror the `compressPdf` signature.
4. **Create `src/hooks/useVideoUpload.ts`** — copy `usePdfUpload.ts`, swap out the imports.
5. **Create `src/components/VideoUploadZone.tsx` + `VideoQueue.tsx` + `VideoSettingsPanel.tsx` + `VideoResultsSection.tsx` + `VideoInspector.tsx`** — copy from the PDF versions and rename.
6. **Add the new route to the header nav** in `src/components/Header.tsx` (the `navLinks` array at the top — both the desktop and mobile sections).
7. **Add a new SEO entry** in `src/config/seo.ts` (extend the `pageSeo` map) and an `<DocumentTitle {...pageSeo.video} />` call at the top of the new page.
8. **Generate a new OG image** by adding an entry to `scripts/generate-og-images.mjs` and running `npm run og:gen`.
9. **Update `vercel.json` headers** if you add a new path with different caching needs.
10. **Add tests** in `src/test/videoProcessor.test.ts` for the pure engine.

---

## 21. Quick File-by-File Reference

(Every meaningful file in one line — keep this handy when you forget where something lives.)

| File | What it does |
|---|---|
| `index.html` | SEO defaults + theme bootstrap script + root mount |
| `src/main.tsx` | Mount React |
| `src/App.tsx` | Provider stack + routes (lazy) + ErrorBoundary + Sonner/Toaster |
| `src/VercelAnalytics.tsx` | Idle-loaded Vercel Analytics + Speed Insights |
| `src/index.css` | Tailwind + monochrome theme CSS vars + custom utilities |
| `src/config/seo.ts` | Per-page SEO registry (8 pages) — title/description/og/jsonLd |
| `src/components/Header.tsx` | Fixed top nav, mobile drawer, theme toggle, prefetch-on-hover |
| `src/components/Footer.tsx` | 4-column footer + socials + legal links |
| `src/components/HeroSection.tsx` | Thin wrapper around ToolHero for the image page |
| `src/components/ToolHero.tsx` | Shared hero (gradient mesh + floating shapes) — image/pdf/rename |
| `src/components/TrustBar.tsx` | 6-tile "Why teams trust" strip |
| `src/components/UploadZone.tsx` | Image drop zone (drag/drop + click) |
| `src/components/ImageQueue.tsx` | Image file grid/list w/ per-file status + ETA + retry + inspect |
| `src/components/SettingsPanel.tsx` | Tabbed Quality/Resize/Format/Output settings UI + filename tokens |
| `src/components/ResultsSection.tsx` | After-compress summary + ZIP download + share |
| `src/components/ImageInspector.tsx` | Detailed image preview dialog (delegates to ComparisonView) |
| `src/components/ComparisonView.tsx` | Side / Slider / Toggle before-after view (zoom, pan, keyboard) |
| `src/components/EmptyState.tsx` | Centered empty-state with icon/title/action |
| `src/components/ErrorBoundary.tsx` | Route-level error boundary w/ chunk-load detection |
| `src/components/MobileActionBar.tsx` | Sticky mobile-only CTA bar |
| `src/components/PageDropOverlay.tsx` | Full-page drop overlay |
| `src/components/LazySection.tsx` | IntersectionObserver-gated mount w/ requestIdleCallback + BlockSkeleton |
| `src/components/NavLink.tsx` | Wrapper around react-router NavLink (currently unused) |
| `src/components/ProfileImage.tsx` | Polished portrait/landscape `<picture>` wrapper w/ gradient frame + status dot |
| `src/components/ScrollToTop.tsx` | Floating back-to-top button |
| `src/components/Skeleton.tsx` | RouteSkeleton / BlockSkeleton / CardSkeleton / QueueSkeleton |
| `src/components/HowItWorks.tsx` | 3-step "How It Works" section |
| `src/components/FeaturesGrid.tsx` | 6-tile bento feature grid |
| `src/components/FAQSection.tsx` | 12 Q&A accordion |
| `src/components/DocumentTitle.tsx` | Per-route `<title>`/meta/JSON-LD injector |
| `src/components/PdfUploadZone.tsx` | PDF drop zone |
| `src/components/PdfQueue.tsx` | PDF file list w/ per-file page progress + smart rec chip |
| `src/components/PdfSettingsPanel.tsx` | PDF presets + slider + DPI/target/gray/strip/range/filename |
| `src/components/PdfResultsSection.tsx` | PDF results + iframe preview + ZIP + confetti |
| `src/components/PdfInspector.tsx` | Detailed PDF preview dialog w/ smart recommendation |
| `src/components/FileRenameUploadZone.tsx` | Any-file drop zone for renamer |
| `src/components/FileRenameRuleBuilder.tsx` | Add/remove/reorder 13 rule kinds (845 lines) |
| `src/components/FileRenamePreviewList.tsx` | Live rename preview with diff highlight |
| `src/components/ui/*` | 49 shadcn/ui primitives (most unused) |
| `src/contexts/ThemeContext.tsx` | Dark/light toggle + localStorage + useTheme() |
| `src/hooks/useImageUpload.ts` | Image batch state machine (the main one) |
| `src/hooks/usePdfUpload.ts` | PDF batch state machine w/ page count + ETA + metadata |
| `src/hooks/useFileRename.ts` | Renamer batch state machine + ZIP builder |
| `src/hooks/useSettings.ts` | Persistent compression settings + filename pattern |
| `src/hooks/imageUploadLimits.ts` | Re-exports MAX_FILES, MAX_FILE_SIZE, etc. |
| `src/hooks/useClipboardPaste.ts` | Document-level paste listener (with accept filter) |
| `src/hooks/usePageDropZone.ts` | Document-level drag/drop state (with accept filter) |
| `src/hooks/use-toast.ts` | Radix toast reducer (used by legacy `<Toaster/>`) |
| `src/hooks/use-mobile.tsx` | `< 768px` detection |
| `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |
| `src/lib/motion.ts` | Shared framer-motion variants (fadeInUp, staggerContainer, etc.) |
| `src/lib/prefetch.ts` | `usePrefetchOnHover` + `prefetchOnIdle` |
| `src/pages/Index.tsx` | Home page (image tool) |
| `src/pages/CompressPdf.tsx` | PDF tool page |
| `src/pages/BulkRename.tsx` | Rename tool page |
| `src/pages/About.tsx` | 1687-line About page (story, stats, philosophy) |
| `src/pages/Contact.tsx` | Contact cards + channels + FAQ |
| `src/pages/PrivacyPolicy.tsx` | Privacy policy (March 8, 2026) |
| `src/pages/TermsOfService.tsx` | Terms of service (March 8, 2026) |
| `src/pages/NotFound.tsx` | 404 with motion + return-home button |
| `src/utils/imageProcessor.ts` | Image engine: calcDimensions, processImage, toMime, isFormatSupported, filename tokens |
| `src/utils/pdfProcessor.ts` | PDF engine: compressPdf, extractPdfMetadata, smart recommendation, filename tokens |
| `src/utils/pdfFormat.ts` | PDF quality presets + filename token docs |
| `src/utils/fileRenamer.ts` | 13-rule rename engine + sanitizeFileName |
| `src/utils/batchValidation.ts` | Pure batch validation w/ ValidationReport (MAX_FILES=50, etc.) |
| `src/test/setup.ts` | matchMedia polyfill + jest-dom |
| `src/test/batchValidation.test.ts` | 12 unit tests for the batch validator |
| `scripts/generate-og-images.mjs` | satori + sharp OG image generator |
| `scripts/optimize-profile.mjs` | sharp profile image AVIF/WebP re-encoder |
| `vercel.json` | SPA rewrites + 1y cache + security headers |

---

## 22. Conventions & Style Guide

- **No comments in code** (per project owner preference). All comments are JSDoc on the few exported functions.
- **Functional components only.** No class components (except `ErrorBoundary`).
- **`useCallback` for every handler** that gets passed as a prop, and `useMemo` for any derived computation that's expensive or that would re-render downstream children.
- **Object URLs always tracked in a `useRef<Set<string>>`** and revoked on unmount + on every file replacement.
- **Inline styles only for theme-driven values** (`style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}`). Everything else is Tailwind classes.
- **`Sonner` for toasts.** Pattern: `toast.success('✅ …')`, `toast.warning('⚠️ …', { description: '...' })`, `toast.error('❌ …')`, `toast.info('ℹ️ …')`.
- **`framer-motion` everywhere for animation.** No CSS keyframes are written for component-level animation (the ones in `index.css` and `tailwind.config.ts` are page-level).
- **Lazy components** use `React.lazy(() => import('./Foo'))`. Eager components are imported normally.
- **State is per-page.** No global state. Each page owns its data flow.
- **TypeScript is loose** (`strict: false`, `noImplicitAny: false`). New code is still typed, but the compiler won't catch every miss.
- **Indentation: 2 spaces.** Quoted with double quotes for JSX strings (consistent with the bulk of the codebase).
- **Naming:** components in PascalCase, hooks in `useCamelCase`, utilities in `camelCase`. All file names match their default export.
- **Icons:** mix of `lucide-react` (default) and `@phosphor-icons/react` (preferred for new code on the marketing pages and tool heroes). Both are available everywhere.
- **The monochrome gradient** `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))` is the signature — use it for the main CTA buttons and the gradient text on headlines.

---

## 23. End-of-Document Cheat Sheet for AI

When making any change, the AI should always ask itself:

1. **Is the change in the image tool, PDF tool, renamer, or shared infra?** The hooks/utilities split makes it easy to find the right file.
2. **Is it a pure-function change?** If yes, add a unit test in `src/test/<engine>.test.ts` — the test infrastructure is set up.
3. **Does it touch the canvas path?** Mind the rotation+mirror pivot logic in `canvasProcess`. Mind the JPEG white-fill. Mind the quality iteration loop.
4. **Does it touch the PDF path?** Mind that pdfjs mutates the input buffer (always `slice(0)`). Mind that the output is image-only.
5. **Does it touch the renamer?** Mind that extension rules run in a separate pass. Mind the dedup-on-collision.
6. **Does it touch a hook that manages ObjectURLs?** Make sure the new URL is added to `urlsRef` and revoked on cleanup.
7. **Does it add a new dependency?** Run `npm install` and update `package.json`. Consider whether the dep is actually needed (the starter has a lot of unused ones).
8. **Does it add a new page or route?** Follow the pattern in §20. Don't forget:
   - The `navLinks` array in `Header.tsx`
   - The `pageSeo` entry in `src/config/seo.ts`
   - The OG image in `public/` (regenerate via `npm run og:gen`)
9. **Does it add a new top-level component?** Place it in `src/components/`. If it's a small inline helper (like the inline `HowItWorksPdf` in `CompressPdf.tsx`), it's fine to keep it in the page file.
10. **Does it add new user-facing settings?** Add a `localStorage` key (or extend the existing `ls-image-compressor-settings` schema with a default), update the `Settings` type in `useSettings.ts`, add a UI control in `SettingsPanel.tsx`, and — most importantly — **wire the setting into the processor in `imageProcessor.ts`**. If you can't wire it, don't add the UI.
11. **Does it add a new SEO/JSON-LD block?** Put the data in `src/config/seo.ts` and reference it from the page via `DocumentTitle`. Don't edit `index.html`'s JSON-LD directly.
12. **Does it change the brand color or theme tokens?** Update both `:root` and `.dark` in `src/index.css`. Test the gradient on the new tokens.

---

**That's the whole app.** 100% client-side, no server, no auth, no tracking. Three privacy-first tools wrapped in a polished, animated marketing site with per-page SEO, code-split heavy deps, monochrome design, and lazy-loaded analytics.
