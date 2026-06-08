# LS Image Compressor — Design Document

> **Project:** LS Image Compressor (internal: `ls-image-compressor`)
> **Domain:** https://img.ladestack.in
> **Author:** Lade Stack (Girish Lade)
> **Last Updated:** June 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Directory Structure](#4-directory-structure)
5. [Routing & App Shell](#5-routing--app-shell)
6. [Component Hierarchy](#6-component-hierarchy)
7. [Image Compressor — Detailed Design](#7-image-compressor--detailed-design)
8. [PDF Compressor — Detailed Design](#8-pdf-compressor--detailed-design)
9. [Bulk File Renamer — Detailed Design](#9-bulk-file-renamer--detailed-design)
10. [Marketing Pages](#10-marketing-pages)
11. [Theme System](#11-theme-system)
12. [State Management & Data Flow](#12-state-management--data-flow)
13. [SEO & Metadata](#13-seo--metadata)
14. [Performance Architecture](#14-performance-architecture)
15. [Testing Strategy](#15-testing-strategy)
16. [Deployment Architecture](#16-deployment-architecture)
17. [Security & Privacy Model](#17-security--privacy-model)
18. [Known Tech Debt & Limitations](#18-known-tech-debt--limitations)
19. [Future Roadmap](#19-future-roadmap)

---

## 1. Project Overview

LS Image Compressor is a **100% client-side, privacy-first** web application that provides three independent file-processing tools entirely in the browser. There is **no server, no upload, no authentication, and no telemetry**.

### 1.1 The Three Tools

| Tool | Route | Purpose | Limits |
|---|---|---|---|
| **Image Compressor / Resizer / Converter** | `/` | Compress, resize, convert, rotate, mirror, grayscale, strip EXIF, target KB | 50 images × 25 MB (750 MB total) |
| **PDF Compressor** | `/compress-pdf` | Shrink PDFs by rasterizing pages as JPEG, rebuild with pdf-lib | 5 PDFs × 100 MB |
| **Bulk File Renamer** | `/bulk-rename` | Rename any file type with 13 stackable rules, live preview, ZIP | 100 files × 200 MB |

### 1.2 Core Principles

- **Zero-server architecture** — every byte stays on the user's device
- **Privacy by default** — no data ever leaves the browser
- **Free forever** — no tiers, no watermarks, no accounts
- **Batch-first UX** — all tools support concurrent multi-file processing
- **Code-split by route** — heavy dependencies only load when needed

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Browser (Client)                       │
│                                                           │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│   │  React    │  │  React   │  │  React   │               │
│   │  Router   │  │  Query   │  │  Error   │               │
│   │  (6.x)    │  │  Client  │  │  Bound.  │               │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘               │
│        │              │              │                     │
│   ┌────▼──────────────▼──────────────▼─────┐               │
│   │            App.tsx (Providers)          │               │
│   │  ┌──────────┬──────────┬──────────┐    │               │
│   │  │ Index.tsx│PdfPage.tsx│RenamePage│    │               │
│   │  │ (eager)  │  (lazy)  │  (lazy)  │    │               │
│   │  └────┬─────┴────┬─────┴────┬─────┘    │               │
│   └───────┼──────────┼──────────┼──────────┘               │
│           │          │          │                           │
│      ┌────▼──┐ ┌────▼──┐ ┌────▼──┐                        │
│      │useImg │ │usePdf │ │useFile│  ← Hooks (state mgmt)   │
│      │Upload │ │Upload │ │Rename │                         │
│      └───┬───┘ └───┬───┘ └───┬───┘                        │
│          │         │          │                             │
│      ┌───▼───┐ ┌──▼────┐ ┌──▼──────┐                      │
│      │image  │ │pdf    │ │file     │  ← Pure utils (engine) │
│      │Process│ │Process│ │Renamer  │                       │
│      └───┬───┘ └───┬───┘ └────┬───┘                       │
│          │         │          │                             │
│     ┌────▼──┐ ┌───▼────┐ ┌───▼─────┐                       │
│     │Canvas │ │pdfjs   │ │JSZip    │  ← Heavy libs         │
│     │BIC    │ │pdf-lib │ │file-    │                       │
│     │       │ │        │ │saver    │                       │
│     └───────┘ └────────┘ └─────────┘                       │
│                                                             │
│   ┌──────────────────────────────────────────┐              │
│   │  localStorage                             │              │
│   │  ├─ ls-image-compressor-settings (JSON)   │              │
│   │  ├─ ls-image-compressor-theme (string)    │              │
│   │  └─ History entries (IndexedDB polyfill)  │              │
│   └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Layer Separation

The codebase follows a strict three-layer separation:

| Layer | Location | Responsibility | Examples |
|---|---|---|---|
| **Page** | `src/pages/` | Route composition, layout, section ordering | `Index.tsx`, `CompressPdf.tsx` |
| **Hook** | `src/hooks/` | State machine, file queue, processing orchestration, stats | `useImageUpload`, `usePdfUpload` |
| **Engine** | `src/utils/` | Pure functions, no React deps, testable in isolation | `imageProcessor.ts`, `fileRenamer.ts` |

### 2.3 Data Flow Pattern

```
User Action → Hook (state update) → Engine (pure computation)
                                      ↓
                                Result (Blob / Plan)
                                      ↓
                              Hook (stores result)
                                      ↓
                              Component (re-renders)
```

This unidirectional flow means:
- **Engines never touch React state** — they receive inputs, return outputs
- **Hooks manage all side effects** — ObjectURL lifecycle, progress tracking, toast dispatch
- **Components are purely declarative** — they read state and call hook methods

---

## 3. Technology Stack

### 3.1 Core Framework

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3.1 | UI framework with hooks-based component model |
| **TypeScript** | 5.8.x | Type safety (strict mode OFF intentionally) |
| **Vite** | 5.4.x | Build tool, HMR via SWC, code splitting |
| **Tailwind CSS** | 3.4.x | Utility-first styling via CSS custom properties |
| **shadcn/ui** | latest | Accessible Radix UI primitives with `cn()` helper |
| **React Router** | 6.30.x | Client-side SPA routing with lazy loading |
| **Framer Motion** | 12.x | Declarative animations for transitions, queues, modals |

### 3.2 Feature Libraries

| Library | Used In | Purpose |
|---|---|---|
| `browser-image-compression` | Image tool | Web Worker fast path for compression |
| `pdfjs-dist` | PDF tool | PDF parsing, page rendering to canvas |
| `pdf-lib` | PDF tool | Rebuilding compressed PDF from rasterized pages |
| `jszip` | All tools (results) | ZIP generation with STORE compression |
| `file-saver` | All tools | Cross-browser `saveAs()` download trigger |
| `lucide-react` | All tools | Primary icon set (queues, buttons, settings) |
| `@phosphor-icons/react` | Marketing pages | Secondary icon set (heroes, features) |
| `sonner` | All tools | Toast notifications |

### 3.3 Development Tooling

| Tool | Purpose |
|---|---|
| **Vitest** + **Testing Library** | Unit & integration testing with jsdom |
| **ESLint** (flat config) | Code quality enforcement |
| **SWC** (via `@vitejs/plugin-react-swc`) | Fast JSX/TS compilation |
| **sharp** | OG image generation script |

### 3.4 Code Splitting (Vite manualChunks)

```
vendor-pdf     → pdfjs-dist + pdf-lib            (~470 KB, loaded on /compress-pdf)
vendor-zip     → jszip + file-saver              (loaded on results + /bulk-rename)
vendor-image   → browser-image-compression       (loaded on home page processing)
vendor-react   → react + react-dom + router      (all pages — merged to avoid circular deps)
vendor-vercel  → @vercel/analytics + speed-insights (loaded idle after first paint)
default        → everything else
```

---

## 4. Directory Structure

```
image-squeeze-express/
├── index.html              # SEO metadata, JSON-LD, theme bootstrap, root mount
├── package.json
├── vite.config.ts          # @ alias, port 8080, manualChunks, dev-only lovable-tagger
├── vitest.config.ts        # jsdom env, @ alias, globals
├── tailwind.config.ts      # CSS-var colors, Inter font, custom keyframes
├── vercel.json             # SPA rewrites, 1y immutable cache, security headers
├── public/
│   ├── pdf.worker.min.mjs  # pdfjs Web Worker (1.2 MB)
│   ├── favicon.*           # ⚡ emoji + PNG fallbacks
│   ├── og-*.{png,svg}      # 6 OG image pairs
│   ├── robots.txt / sitemap*.xml
│   └── logo-mark.svg
├── scripts/
│   ├── generate-og-images.mjs    # satori + sharp OG generator
│   └── optimize-profile.mjs      # sharp AVIF/WebP encoder
├── src/
│   ├── main.tsx                  # ReactDOM.createRoot
│   ├── App.tsx                   # Provider stack, routes, ErrorBoundary, lazy VercelAnalytics
│   ├── VercelAnalytics.tsx       # Idle-loaded Analytics + SpeedInsights
│   ├── index.css                 # Tailwind + monochrome theme CSS vars + utilities
│   ├── assets/                   # profile.{webp,avif} @2x
│   ├── config/seo.ts             # Per-page SEO registry (8 pages)
│   ├── contexts/ThemeContext.tsx  # Dark/light toggle + localStorage persistence
│   ├── components/               # 27 shared UI components
│   │   ├── ui/                   # 49 shadcn/ui primitives (many unused)
│   │   ├── Header.tsx / Footer.tsx / ToolHero.tsx
│   │   ├── UploadZone.tsx / ImageQueue.tsx / SettingsPanel.tsx / ResultsSection.tsx
│   │   ├── ImageInspector.tsx / ComparisonView.tsx
│   │   ├── PdfUploadZone.tsx / PdfQueue.tsx / PdfSettingsPanel.tsx / PdfResultsSection.tsx
│   │   ├── PdfInspector.tsx
│   │   ├── FileRenameUploadZone.tsx / FileRenameRuleBuilder.tsx / FileRenamePreviewList.tsx
│   │   ├── DocumentTitle.tsx / LazySection.tsx / ErrorBoundary.tsx
│   │   ├── EmptyState.tsx / MobileActionBar.tsx / PageDropOverlay.tsx
│   │   ├── ScrollToTop.tsx / Skeleton.tsx / ProfileImage.tsx / NavLink.tsx
│   │   ├── TrustBar.tsx / HowItWorks.tsx / FeaturesGrid.tsx / FAQSection.tsx
│   │   └── HeroSection.tsx
│   ├── hooks/
│   │   ├── useImageUpload.ts      # Image batch state machine
│   │   ├── usePdfUpload.ts        # PDF batch state machine
│   │   ├── useFileRename.ts       # Renamer state machine
│   │   ├── useSettings.ts         # Persistent image settings
│   │   ├── useClipboardPaste.ts   # Global Ctrl+V handler
│   │   ├── usePageDropZone.ts     # Document drag-and-drop tracker
│   │   ├── use-toast.ts           # Legacy Radix toast reducer
│   │   ├── use-mobile.tsx         # < 768px viewport detection
│   │   └── imageUploadLimits.ts   # MAX_FILES, MAX_FILE_SIZE constants
│   ├── lib/
│   │   ├── utils.ts               # cn() helper (clsx + tailwind-merge)
│   │   ├── motion.ts              # Shared framer-motion variants
│   │   └── prefetch.ts            # usePrefetchOnHover + prefetchOnIdle
│   ├── pages/
│   │   ├── Index.tsx              # 🖼️ Image tool (eager-loaded)
│   │   ├── CompressPdf.tsx        # 📕 PDF tool (lazy-loaded)
│   │   ├── BulkRename.tsx         # ✏️ Rename tool (lazy-loaded)
│   │   ├── About.tsx              # Story, stats, philosophy (lazy)
│   │   ├── Contact.tsx            # Channels + FAQ (lazy)
│   │   ├── PrivacyPolicy.tsx      # Privacy policy (lazy)
│   │   ├── TermsOfService.tsx     # Terms of service (lazy)
│   │   └── NotFound.tsx           # 404 page (lazy)
│   ├── utils/
│   │   ├── imageProcessor.ts      # Canvas pipeline, format detection, filename tokens
│   │   ├── pdfProcessor.ts        # pdfjs → JPEG → pdf-lib, smart recommendation
│   │   ├── pdfFormat.ts           # PDF quality presets, token docs
│   │   ├── fileRenamer.ts         # 13-rule rename engine, sanitizeFileName
│   │   └── batchValidation.ts     # Batch validation report (50 files, 750 MB)
│   └── test/
│       ├── setup.ts               # matchMedia polyfill + jest-dom
│       ├── batchValidation.test.ts
│       ├── fileRenamer.test.ts
│       ├── imageProcessor.test.ts
│       ├── pdfProcessor.test.ts
│       └── example.test.ts
└── dist/                         # Production build output
```

---

## 5. Routing & App Shell

### 5.1 Provider Stack (App.tsx)

```
<QueryClientProvider>
  <ThemeProvider>
    <TooltipProvider>
      <Toaster />           ← Legacy Radix toast viewport
      <Sonner />            ← Active toast notifications
      <BrowserRouter>
        <Suspense fallback={<RouteSkeleton />}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />          // eager
              <Route path="/compress-pdf" ... />              // lazy
              <Route path="/bulk-rename" ... />               // lazy
              <Route path="/about" ... />                     // lazy
              <Route path="/contact" ... />                   // lazy
              <Route path="/privacy" ... />                   // lazy
              <Route path="/terms" ... />                     // lazy
              <Route path="*" element={<NotFound />} />       // lazy
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <VercelAnalyticsLazy />   ← Idle-loaded after first paint
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
```

### 5.2 Route Loading Strategy

- **Index (home page) is eager** — it's the landing page and primary entry point
- **All other pages are lazy** via `React.lazy(() => import(...))`
- **Idle prefetch** — `prefetchOnIdle` warms all lazy chunks after first paint
- **Hover prefetch** — `usePrefetchOnHover` on header nav links warms chunks on hover/focus/touch

### 5.3 Error Boundary

The route-level `ErrorBoundary`:
- Catches all rendering errors
- Detects `ChunkLoadError` (stale deployment cache) → shows "New version available — Reload"
- Shows original error for other failures with "Try again" / "Go home" CTAs
- Collapsible "Technical details" panel

### 5.4 Shared Shell

Every page renders:
```
<Header />                // Fixed top nav, z-50, backdrop-blur, mobile drawer
<main>{page content}</main>
<Footer />                // 4-column grid, social links, legal
<ScrollToTop />           // Floating back-to-top button
<DocumentTitle />         // Per-route <title>/meta/JSON-LD
```

---

## 6. Component Hierarchy

### 6.1 Shared Components

```
Header
├── Logo (⚡ + "LS Image Compressor")
├── Desktop Nav (md:flex)
│   ├── Anchor links (How It Works / Features / FAQ) — smooth scroll on /
│   ├── Route links (Compress PDF / Bulk Rename) — prefetch on hover
│   └── Theme toggle
└── Mobile Nav
    ├── Theme toggle
    └── Hamburger → Full-screen slide-in drawer
        ├── All desktop links
        └── About / Privacy / Terms / Contact

Footer
├── Logo + blurb
├── Product column (tool links)
├── Company column (About, Contact)
├── Legal column (Privacy, Terms)
└── Social icons (Instagram, LinkedIn, GitHub, CodePen, Mail, Website)

ToolHero (shared by all 3 tools)
├── Radial gradient mesh background (4 ellipses)
├── 3 floating blurred shapes (framer-motion, 18-25s loops)
├── Headline + subhead + 4 trust badges
├── Upload zone (tool-specific)
│   └── Children injected by each tool page
└── Below-fold: LazySection-gated marketing sections

LazySection (IntersectionObserver + requestIdleCallback gating)
├── minHeight placeholder (prevents layout shift)
└── children (mounted on intersection + idle callback)
```

### 6.2 Image Tool Components

```
Index.tsx
├── Header
├── <main>
│   ├── HeroSection (wraps ToolHero)
│   │   ├── UploadZone
│   │   ├── SettingsPanel
│   │   │   ├── Tab: Quality (presets + slider + auto-optimize + target KB)
│   │   │   ├── Tab: Resize (W/H inputs + aspect lock + 9 social presets)
│   │   │   ├── Tab: Format (5 format buttons + browser support detection)
│   │   │   └── Tab: Output (rotation grid + mirror + grayscale + filename tokens)
│   │   └── ImageQueue
│   │       ├── View toggle (grid/list)
│   │       ├── Stats bar (N files, N done, N failed)
│   │       ├── Progress bar (animated shimmer, ETA)
│   │       ├── Per-file cards (thumbnail, name, size, dims, status, actions)
│   │       └── Compress button
│   ├── ResultsSection
│   │   ├── Animated stat counters (N images / Saved KB / % smaller)
│   │   ├── Per-file before/after cards with thumbnails
│   │   ├── Download single / Download all as ZIP
│   │   ├── Share row (Twitter, WhatsApp, Copy Link)
│   │   └── Process More button
│   ├── LazySection: TrustBar
│   ├── LazySection: HowItWorks
│   ├── LazySection: FeaturesGrid
│   └── LazySection: FAQSection
├── Footer
├── PageDropOverlay
├── MobileActionBar
├── ImageInspector (modal)
│   ├── Comparison tab (delegates to ComparisonView)
│   ├── Metadata tab (dims, MIME, size, exif)
│   └── Settings snapshot + recommendation
└── ComparisonView
    ├── Side-by-side (2 panels)
    ├── Slider (draggable divider, clip-path)
    └── Toggle (click/space flip)
```

### 6.3 PDF Tool Components

```
CompressPdf.tsx
├── Header
├── <main>
│   ├── ToolHero (tool="pdf")
│   │   ├── PdfUploadZone
│   │   ├── PdfSettingsPanel
│   │   │   ├── 3 preset buttons (Strong/Balanced/Light)
│   │   │   ├── Quality slider (10-95%)
│   │   │   ├── Advanced: DPI / Target KB / Grayscale / Strip Metadata / Page Range
│   │   │   └── Filename pattern with token inserter
│   │   └── PdfQueue
│   │       ├── Per-file first-page thumbnail + page count + progress
│   │       ├── Smart recommendation chip (applies suggested preset)
│   │       └── Speed/ETA footer
│   ├── PdfResultsSection
│   │   ├── Animated stat counters
│   │   ├── Per-file rows (name, size before/after, reduction, pages, quality)
│   │   ├── Preview (iframe), Download single, ZIP download
│   │   └── Confetti burst
│   ├── LazySection: HowItWorksPdf (inline)
│   ├── LazySection: FeaturesPdf (inline)
│   └── LazySection: FaqPdf (inline)
├── Footer, PageDropOverlay, MobileActionBar, ScrollToTop
└── PdfInspector (modal)
    ├── iframe preview of compressed PDF
    ├── Metadata card (pages, size, version, author, title)
    ├── Smart recommendation card
    └── Download button
```

### 6.4 Rename Tool Components

```
BulkRename.tsx
├── Header
├── <main>
│   ├── ToolHero (tool="rename")
│   │   ├── FileRenameUploadZone
│   │   ├── FileRenameRuleBuilder (845 lines — the largest component)
│   │   │   ├── Add Rule dropdown (13 rule types)
│   │   │   ├── Per-rule editor (form fields per rule kind)
│   │   │   ├── Drag-handle badge + Up/Down/Remove buttons
│   │   │   └── Rule factory defaults
│   │   └── FileRenamePreviewList
│   │       ├── Stats bar (N files, X renamed, Y total size)
│   │       ├── Per-file diff (original struck-through, changed highlight)
│   │       ├── Add + Clear buttons
│   │       └── Download ZIP button (animated progress bar)
│   ├── StatsRow (inline: Files / Will rename / Total size)
│   ├── LazySection: HowItWorksRename (inline)
│   ├── LazySection: FeaturesRename (inline)
│   └── LazySection: FaqRename (inline)
└── Footer, PageDropOverlay, MobileActionBar, ScrollToTop
```

---

## 7. Image Compressor — Detailed Design

### 7.1 Hook: `useImageUpload`

**State shape:**
```typescript
interface UploadedFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;      // resolved async
  originalHeight: number;
  preview: string;            // ObjectURL
  status: 'ready' | 'processing' | 'done' | 'error';
  error?: string;
  result?: ProcessResult;     // { blob, width, height, sizeBytes, reduction }
  processedFile?: File;       // Final downloadable File
  processedPreview?: string;  // ObjectURL for result
}

interface ProcessingStats {
  bytesPerSecond: number;
  etaMs: number | null;
  startedAt: number;
  completedBytes: number;
}
```

**Key methods:**

| Method | Description |
|---|---|
| `addFiles(fileList)` | Validates via `validateBatch`, creates ObjectURLs, resolves dims, shows toasts |
| `removeFile(id)` | Revokes ObjectURLs, removes from queue |
| `retryFile(id, settings)` | Resets to `ready`, re-processes single file |
| `clearAll()` | Revokes all ObjectURLs, empties queue |
| `processAll(settings)` | Starts processing all ready/error files |
| `processFiles(ids, settings)` | Sequential processing loop with ETA tracking |

**ObjectURL lifecycle:**
- All preview URLs tracked in `urlsRef = useRef<Set<string>>()`
- `revokeUrl(url)` removes from set and calls `URL.revokeObjectURL`
- On unmount: all tracked URLs revoked

**Processing flow:**
```
processAll(settings)
  → snapshot targets via setFiles callback
  → yield to React (await Promise.resolve())
  → mark all as 'processing'
  → for each target (SEQUENTIAL):
      → update currentItem, processingText
      → processImage(file, settings, originalSize)
      → store result, create ObjectURL for blob
      → update progress = round(completed/total * 100)
      → update ETA = (totalBytes - completedBytes) / bytesPerSecond
  → after loop: single toast (all success / partial / all failed)
```

### 7.2 Engine: `imageProcessor.ts`

**`processImage(file, settings, originalSize)` algorithm:**

```
1. Resolve output MIME: toMime(settings.outputFormat, file.type)
2. Read original dimensions via getImageDimensions(file)
3. Compute target dimensions via calcDimensions(origW, origH, settings.w, settings.h, lock)
4. Determine if canvas path needed:
   - hasTransforms = rotation || mirror || grayscale || stripEXIF
   - needsResize = targetW !== origW || targetH !== origH
   - needsFormatChange = outputMime !== file.type
5. Compute quality:
   - If autoOptimize → calculateOptimalQuality(originalSize, targetSizeKB, outputFormat, hasTransforms)
   - Else → settings.quality
6. CANVAS PATH (transforms/resize/format change):
   → loadImage → draw with transforms → toBlob
   → If targetSizeKB: iterative loop (max 5 iters, quality -= 10, floor 10)
7. FAST PATH (no transforms, same format/dims):
   → browser-image-compression with useWebWorker: true
8. Return { blob, width, height, sizeBytes, reduction }
```

**Canvas transform pipeline (canvasProcess):**
```
1. Create offscreen canvas
   → For 90°/270° rotation: swap width/height
2. JPEG output → fill white (no alpha)
3. Fit source letterboxed (center, preserve aspect, no crop)
4. If rotation/mirror:
   → translate origin to center of fitted image
   → ctx.scale(-1, 1) for mirror
   → ctx.rotate(deg * PI / 180) for rotation
   → drawImage at centered offset
5. Else: direct drawImage at offset
6. If grayscale: BT.601 luma per-pixel (0.299R + 0.587G + 0.114B)
7. canvas.toBlob(callback, mime, quality/100)
```

**calcDimensions (social-preset-aware):**
```
- Neither dimension set → return original
- Only width set + lock on → derive height = width / aspect
- Only height set + lock on → derive width = height * aspect
- Both set → use as-is (preset behavior: no cropping, letterboxed)
```

**Format recommendation engine (recommendFormat):**
```
1. Quick path: files < 5 KB skip analysis
2. Sample 64×64 thumbnail
3. Evaluate:
   - Transparency detected → WebP (with alpha) or PNG
   - Graphics/screenshots (low color count, high edge amplitude) → WebP
   - Photographic (high soft-edge ratio) → AVIF > WebP > JPEG
4. Return { recommendedFormat, recommendedQuality, estimatedSavings, recommendationReason }
```

### 7.3 Settings Panel (useSettings)

**Persistent defaults (localStorage):**
```typescript
{
  quality: 75,
  autoOptimize: true,
  targetSizeKB: null,
  width: null, height: null, lockAspectRatio: true, selectedPreset: null,
  outputFormat: 'webp',
  stripEXIF: true, grayscale: false, rotation: 0, mirror: false,
  qualityPreset: 'balanced',
  filenamePattern: '{name}_q{q}.{format}',
}
```

**Smart dimension derivation:**
`computeAspectDimensions(origW, origH, targetW, targetH, lock)` — when lock is on, setting width auto-computes height and vice versa based on the source file's aspect ratio. Used by `setWidth(value, sourceDims)` and `setHeight(value, sourceDims)`.

**Social media presets (9):**
IG Post (1080²), IG Story (1080×1920), LinkedIn Post (1200×627), LI Banner (1584×396), WhatsApp (500²), Twitter (1200×675), FB Cover (820×312), YT Thumb (1280×720), Full HD (1920×1080).

### 7.4 ComparisonView

Three comparison modes for before/after inspection:

| Mode | Implementation | Controls |
|---|---|---|
| **Side-by-side** | Two `<img>` panels, 1px divider | — |
| **Slider** | Two layers: bottom = "after", top clipped via `clipPath: inset(0 ${100-pos}% 0 0)` | Drag, arrows (2px/10px with shift) |
| **Toggle** | Single image flips on click/space | Click, arrows, space |

**Keyboard shortcuts:**
- `1` / `2` / `3` → switch mode
- `←` / `→` → slider position or toggle
- `+` / `-` / `0` → zoom in/out/reset (0.5×–8×)
- Pan with pointer capture
- Pinch/wheel zoom

---

## 8. PDF Compressor — Detailed Design

### 8.1 Hook: `usePdfUpload`

**Differences from useImageUpload:**
- `MAX_PDF_FILES = 5`, `MAX_PDF_SIZE = 100 MB`
- `UploadedPdf` has `progress: number` (0..1 per-file), `pageCount: number | null`, `metadata?: PdfMetadata`
- Uses `getPdfPageCount(file)` (lazy-loads pdfjs-dist, configures worker at `/pdf.worker.min.mjs`)
- ETA computed per-page, not per-byte

### 8.2 Engine: `pdfProcessor.ts`

**`compressPdf(file, settings, onProgress?)` algorithm:**

```
1. originalSize = file.size
2. pdfjs.getDocument({ data: <sliced ArrayBuffer> })  ← slice(0) to preserve original
3. Create pdf-lib PDFDocument
4. Set metadata: title/producer/creator = "LS Image Compressor" (unless stripMetadata)
5. For each page (1..numPages):
   a. page.render({ canvasContext, viewport, canvas }).promise
   b. canvas.toBlob('image/jpeg', quality) → bytes
   c. outDoc.embedJpg(bytes)
   d. outDoc.addPage([w, h])
   e. newPage.drawImage(jpg, { x:0, y:0, width, height })
   f. page.cleanup()
   g. onProgress?.(i / totalPages)
   h. Every 3 pages → await new Promise(r => setTimeout(r, 0))  // UI yield
6. outDoc.save({ useObjectStreams: true }) → Uint8Array
7. Wrap in Blob({ type: 'application/pdf' })
8. Return { blob, pageCount, sizeBytes, reduction, quality, scale, durationMs, finalDpi }
```

**Target-size iteration:**
When `settings.targetSizeKB` is set, run loop decrementing quality (−0.1) and DPI (0.9×) up to 5 times until blob fits target.

**Smart recommendation (extractPdfMetadata):**
```
1. Read page dimensions → classify as A4/Letter/Legal/A3/A5/Custom
2. Render first page → analyze:
   - Edge detection: soft-edge ratio vs hard-edge ratio
   - Color quantization: 4-bit palette count
3. Classify:
   - text-heavy: hardRatio > 0.15 || (colors < 200 && hardRatio > 0.08)
   - image-heavy: softRatio > 0.3 && colors > 1500
4. Recommend: text-heavy → Light preset, image-heavy → Strong preset
5. Return { recommendedPreset, recommendedQuality, recommendationReason, estimatedSavings }
```

**PDF quality presets (from pdfFormat.ts):**

| Preset | JPEG Quality | Max Width | Scale |
|---|---|---|---|
| Strong | 0.4 | 1100 px | 1.25× |
| Balanced | 0.6 | 1700 px | 1.75× |
| Light | 0.82 | 2400 px | 2.25× |

### 8.3 Known Limitation

PDF compression **loses the text layer**. Every page becomes a full-page JPEG image embedded in a new PDF. Text is not selectable or searchable. This is documented in the FAQ and tool description.

---

## 9. Bulk File Renamer — Detailed Design

### 9.1 Hook: `useFileRename`

**State:**
```typescript
files: RenameFile[]           // { id, file, name, size, type }
rules: RenameRule[]           // 13 rule kinds in user-defined order
isZipping: boolean
zipProgress: number           // 0..100
plan: RenamePlanEntry[]       // memoized via useMemo
```

**Constants:** `MAX_RENAME_FILES = 100`, `MAX_RENAME_SIZE = 200 MB`

**downloadZip() flow:**
```
1. Create new JSZip()
2. For each file: folder.file(sanitizeFileName(plan[i].renamedName), f.file)
   → Progress: 0-90%
3. zip.generateAsync({ type: 'blob', compression: 'STORE' })
   → Progress: 90-100% (STORE = no re-compression, fast)
4. saveAs(blob, 'ls-image-compressor-rename.zip')
5. toast.success('Renamed N of M files. ZIP downloaded.')
```

### 9.2 Engine: `fileRenamer.ts`

**Rule application order:**
1. `splitExtension(name)` → `{ base, ext }`
2. Apply all base rules (sequentially) to `base`
3. Apply all ext rules to `ext` (separate pass)
4. Recombine: `newBase + newExt`
5. De-duplicate: if lowercased candidate seen, append ` (2)`, ` (3)`, etc.

**The 13 rules:**

| # | Rule kind | Algorithm | Edge cases |
|---|---|---|---|
| 1 | `replace` | `String.replace()` with plain text or RegExp | Invalid regex → no-op (try/catch) |
| 2 | `prefix` | `text + s` | Empty text → no-op |
| 3 | `suffix` | `s + text` | Empty text → no-op |
| 4 | `numbering` | `padded + separator + s` or `s + separator + padded` | pad=0 → no padding |
| 5 | `case` | `toLowerCase/toUpperCase/title/sentence` | Custom helper per mode |
| 6 | `whitespace` | `/\s+/g` → `-` / `_` / `''` | Collapse runs first |
| 7 | `removeChars` | `new RegExp([escaped chars], 'g')` → `''` | Regex-escapes input |
| 8 | `date` | `formatDate(lastModified or now, format)` | 7 format options |
| 9 | `insertAt` | `s.slice(0, idx) + text + s.slice(idx)` | Negative idx = from end |
| 10 | `trim` | `s.slice(count)` or `s.slice(0, -count)` or truncate | `maxLength > 3` for ellipsis |
| 11 | `replaceExt` | `ext = ext.toLowerCase/upper/set('')/remove` | Leading dot normalization |
| 12 | `extractCounter` | `/\d+/g` matches → `startVal + index` → padded | No digits → fallbackStart |
| 13 | `reverse` | `s.split('').reverse().join('')` | Unicode grapheme clusters may break |

**sanitizeFileName(name):**
1. Strip `<>:"/\|?*` and control chars (`\x00-\x1f`) → `_`
2. Collapse consecutive underscores
3. Trim leading/trailing whitespace, dots, underscores
4. Cap at 200 characters
5. Fallback to `'untitled'` if empty

**highlightDiff(original, renamed):**
Finds longest common prefix and suffix; wraps middle segment in styled `<span>`.

### 9.3 RuleBuilder (845 lines — largest component)

- **Add rule popover**: grid of 13 rule cards, each with icon, label, description
- **Rule card**: numbered badge, rule type label, editor fields, Up/Down/Remove buttons
- **Per-rule editors**:
  - `replace`: text inputs for find/replace, regex/case-insensitive toggles (Checkbox)
  - `prefix`/`suffix`: single text input
  - `numbering`: position (Select), separator (Input), start (Input[number]), pad (Slider 0-10)
  - `case`: 4 toggle buttons (lower/UPPER/Title/Sentence)
  - `whitespace`: 4 toggle buttons (a-b / a_b / ab / a b)
  - `removeChars`: text input (character set)
  - `date`: format (7-option Select), separator (Input), position (Select), "use now" (Switch)
  - `insertAt`: index (Input[number]), text (Input)
  - `trim`: mode (4-option Select), count (Input[number]), maxLength (Input[number]), ellipsis (Switch)
  - `replaceExt`: mode (4-option Select), extension (Input)
  - `extractCounter`: where (Select: first/last), position (Select), separator (Input), pad (Input[number]), fallbackStart (Input[number])
  - `reverse`: description text only

---

## 10. Marketing Pages

### 10.1 About Page (1687 lines, 70 KB)

**Sections:**
- Hero: "Built in India, for the world" + 2 CTAs
- Stats: 4 animated count-up tiles (25K+ Active Users, 99.7% Uptime, 4.9/5 Rating, 100% Open Source)
- Pillars: Mission, Vision, Story (weekend project origin 2024)
- Journey Timeline: 2024 Q3 → 2026 Q1 milestones
- Philosophy: 4 cards on local-first ethos
- Values: 6 cards (Privacy First, Open Source, User Respect, etc.)
- Tech Stack: 4 cards (Engines, Foundation, Tooling, Distribution)
- Built For: 4 audience cards
- Profile: 2-column with `<picture>` (AVIF/WebP @2x) + bio + skills + socials
- CTA: "Try the tools"

### 10.2 Contact, Privacy, Terms

- **Contact.tsx**: Contact cards, social links, FAQ-style questions, response time card
- **PrivacyPolicy.tsx**: Full privacy policy (March 8, 2026), table of contents
- **TermsOfService.tsx**: Full terms (March 8, 2026), table of contents

### 10.3 Shared Patterns

- All use `DocumentTitle` with per-page SEO from `config/seo.ts`
- All use `framer-motion` `useInView` fade-in animations
- `About.tsx` uses inline `useCountUp` hook (1200ms, cubic-ease-out)
- Legal pages use numbered sections with smooth-scrollable TOC

---

## 11. Theme System

### 11.1 CSS Variables (index.css)

**Light mode (`:root`):**
```css
--background: 0 0% 100%;
--foreground: 0 0% 0%;
--primary: 0 0% 0%;          /* Pure black */
--accent: 0 0% 9%;           /* Near-black */
--destructive: 0 72% 46%;    /* Red (kept for semantics) */
--success: 145 55% 36%;      /* Green */
--warning: 35 92% 50%;       /* Amber */
--border: 0 0% 88%;
--radius: 0.625rem;
```

**Dark mode (`.dark`):**
```css
--background: 0 0% 0%;       /* True black */
--foreground: 0 0% 98%;
--primary: 0 0% 98%;         /* Near-white */
--accent: 0 0% 15%;
--border: 0 0% 15%;
```

**Legacy aliases** (remapped to greyscale so old code compiles):
```css
--indigo: 0 0% 0%;    --teal: 0 0% 32%;
--violet: 0 0% 0%;    --cyan: 0 0% 32%;
--brand: 0 0% 0%;     --brand-2: 0 0% 32%;
```

### 11.2 Signature Gradient

The brand identity uses:
```css
background: linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-2)));
```
Applied to: CTA buttons, headline gradient text, progress bars.

### 11.3 Theme Context (ThemeContext.tsx)

- Default: `dark` (if `localStorage` key missing)
- Persists to `localStorage['ls-image-compressor-theme']`
- Toggles `document.documentElement.classList.toggle('dark', darkMode)`
- `index.html` has inline script that reads localStorage BEFORE React mounts → prevents FOUC

### 11.4 Custom CSS Utilities

| Utility | Purpose |
|---|---|
| `.glass-card` | `backdrop-filter: blur(20px) saturate(180%)` card |
| `.gradient-text` | Text with brand gradient fill |
| `.gradient-bg` | Background with brand gradient |
| `.shadow-elev-1..4` | Themed elevation shadows |
| `.metallic-text` | Vertical highlight gradient for headings |
| `.text-fluid-hero` | `clamp(1.875rem, 2.2vw + 1rem, 3rem)` fluid type |
| `.safe-bottom` | `padding-bottom: env(safe-area-inset-bottom)` |
| `.scrollbar-hide` / `.scrollbar-thin` | Cross-browser scrollbar control |
| `.section-pad` | Responsive vertical padding (sm/lg breakpoints) |

---

## 12. State Management & Data Flow

### 12.1 No Global State Store

The app intentionally uses **no global state library** (no Redux, Zustand, Jotai). All state is local React state in page-level hooks:

- `useImageUpload` — owns the image file queue and processing state
- `usePdfUpload` — owns the PDF file queue and processing state
- `useFileRename` — owns the rename file queue, rules, and ZIP state
- `useSettings` — owns image compression settings (persisted to localStorage)
- `ThemeContext` — only app-wide context (dark/light mode)

### 12.2 Data Flow Diagram

```
┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│  User Action  │────▶│   Page Hook     │────▶│   Pure Engine │
│  (drop/click) │     │  (state mgmt)   │     │  (computation)│
└──────────────┘     └───────┬────────┘     └──────┬───────┘
                             │                      │
                             │              ┌───────▼────────┐
                             │              │  Result (Blob,  │
                             │              │  Plan, Metadata)│
                             │              └───────┬────────┘
                             │                      │
                             ▼                      ▼
                    ┌──────────────────────────────────┐
                    │  Component (reads state, renders) │
                    └──────────────────────────────────┘
```

### 12.3 Persistence Strategy

| Data | Storage | Key |
|---|---|---|
| Image settings | `localStorage` | `ls-image-compressor-settings` |
| Theme preference | `localStorage` | `ls-image-compressor-theme` |
| Processing history | Planned for IndexedDB | Per-tool entries |

### 12.4 Derived State (Memos)

Hooks expose derived state via `useMemo`:
- `hasFiles = files.length > 0`
- `allDone = files.every(f => f.status === 'done' | 'error')`
- `processedFiles = files.filter(f => f.status === 'done')`
- `readyCount = files.filter(f => f.status === 'ready' | 'error').length`
- `plan = useMemo(...)` (renamer — rebuilds on files or rules change)

---

## 13. SEO & Metadata

### 13.1 Two-Layer Strategy

**Layer 1: `index.html` (global defaults)**
- Comprehensive meta tags (SEO, OG, Twitter, Dublin Core, geo, article, profile)
- 9 JSON-LD blocks (WebSite, WebApplication, ItemList, FAQPage, Organization, Person, SoftwareApplication, 3× HowTo, Service, BreadcrumbList)
- Inline theme bootstrap (pre-React localStorage read)
- Font preconnects, DNS prefetches, resource hints

**Layer 2: `DocumentTitle` component (per-route)**
- Writes `<title>`, `<meta name="description">`, `<meta name="keywords">`
- Writes OG/Twitter meta tags with page-specific values
- Sets `<link rel="canonical">`
- Injects per-page JSON-LD (tagged `data-page-jsonld` for clean replacement)
- Sets `robots` / `googlebot` directives
- Uses `useLayoutEffect` to apply before paint

### 13.2 SEO Registry (src/config/seo.ts)

8 pages registered: `home`, `pdf`, `rename`, `about`, `contact`, `privacy`, `terms`, `notFound`.

Each entry includes:
- `title`, `shortTitle`, `description`, `shortDescription`, `keywords`
- `canonical`, `ogImage`, `ogType`, `twitterCard`
- `noindex` (only notFound)
- `jsonLd` (object or array per page — FAQPage, HowTo, AboutPage, etc.)

### 13.3 OG Images

6 dedicated OG images (PNG + SVG) generated via `scripts/generate-og-images.mjs` using `satori` + `sharp`:
`/og-image.png`, `/og-pdf.png`, `/og-rename.png`, `/og-about.png`, `/og-contact.png`, `/og-privacy.png`, `/og-terms.png`

---

## 14. Performance Architecture

### 14.1 Loading Strategy

```
                    ┌─────────────────────────────────┐
                    │  First paint (critical path)      │
                    │  ├─ index.html (SEO + theme)      │
                    │  ├─ main.tsx → App.tsx            │
                    │  └─ Index.tsx (eager)              │
                    │     ├─ vendor-react chunk          │
                    │     └─ vendor-motion chunk         │
                    └─────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Idle (requestIdleCallback) │
                    │  ├─ prefetchOnIdle → warm lazy  │
                    │  │  route chunks                │
                    │  └─ VercelAnalyticsLazy         │
                    └─────────────────────────┘
```

### 14.2 Code Splitting

| Chunk | Loaded When | Size |
|---|---|---|
| `vendor-react` | First paint | React + DOM + Router |
| `vendor-motion` | First paint | framer-motion |
| `vendor-image` | Image processing starts | browser-image-compression |
| `vendor-pdf` | User visits /compress-pdf | pdfjs-dist + pdf-lib (~470 KB) |
| `vendor-zip` | User triggers download | jszip + file-saver |
| `vendor-vercel` | Idle after first paint | Analytics + SpeedInsights |

### 14.3 Rendering Optimizations

- **LazySection**: IntersectionObserver + requestIdleCallback gating for below-fold sections
- **Suspense**: `<RouteSkeleton />` fallback for lazy routes
- **ObjectURL cleanup**: Tracked in `useRef<Set>` and revoked on unmount
- **PDF UI yield**: `await setTimeout(0)` every 3 pages during processing
- **ComparisonView zoom**: Pointer-capture based, requestAnimationFrame throttle
- **Shimmer progress**: `will-change: transform` on animated elements

### 14.4 UsePrefetchOnHover

Declarative hover/focus/touch handlers that `import()` lazy route chunks on first interaction, warming the browser cache before navigation.

```
<Link to="/compress-pdf" {...usePrefetchOnHover(loadCompressPdf)} />
```

### 14.5 prefetchOnIdle

Bulk-prefetches all lazy chunks after the browser completes first paint:
```typescript
useEffect(() => {
  prefetchOnIdle([loadCompressPdf, loadBulkRename, loadAbout, ...]);
}, []);
```

---

## 15. Testing Strategy

### 15.1 Test Infrastructure

- **Vitest** with jsdom environment
- `@testing-library/jest-dom` for matchers
- `globals: true` so `describe`/`it`/`expect` are global
- `setupFiles: src/test/setup.ts` (matchMedia polyfill + jest-dom)

### 15.2 Test Coverage

| Module | Tests | What's tested |
|---|---|---|
| `imageProcessor.test.ts` | 72 | `formatFileSize`, `getCompressionRatio`, `calcDimensions` (center-crop), `estimateQualityForSize`, `isFormatSupported`, filename token replacement, AVIF detection |
| `fileRenamer.test.ts` | 83 | `splitExtension`, all 13 rules individually and combined, rule ordering, dedup collisions, `sanitizeFileName` edge cases (hidden files, trailing dots, illegal chars) |
| `pdfProcessor.test.ts` | 25 | `formatBytes`, `getReductionRatio`, `getQualityPresetSettings`, preset bounds, filename pattern + tokens, filename sanitization |
| `batchValidation.test.ts` | 16 | Overflow, oversized skip, GIF detection, total-cap warning, FIFO ordering |

### 15.3 What's NOT Tested

- **Hooks** — `useImageUpload`, `usePdfUpload`, `useFileRename`, `useSettings` have no tests
- **Components** — No component tests exist (no RTL tests)
- **Pages** — No page-level integration tests
- **E2E** — No Playwright / Cypress tests

---

## 16. Deployment Architecture

### 16.1 Vercel Configuration (vercel.json)

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/(.*)\\.(js|css|woff2?|…)", "headers": [
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

### 16.2 Build Settings

| Setting | Value |
|---|---|
| Framework | Vite (auto-detected) |
| Build command | `npm run build` |
| Output dir | `dist` |
| Install command | `npm install` |
| Node version | 20.x |

### 16.3 SPA Rewrites

All paths rewrite to `/index.html` for deep-link support. React Router handles client-side routing after the initial load.

### 16.4 Cache Strategy

- Hashed assets (JS, CSS, fonts, images): 1 year immutable
- `robots.txt`: 1 hour
- `sitemap.xml`: 30 minutes
- HTML (`index.html`): no explicit cache (defaults to Vercel's CDN)

---

## 17. Security & Privacy Model

### 17.1 Core Guarantee

**Zero data ever leaves the user's device.** The app architecture ensures this through:

1. **No server** — no backend, no API routes, no database
2. **No upload** — files are read via `File API` and processed entirely in memory
3. **No telemetry** — Vercel Analytics is cookieless and idle-loaded
4. **No third-party requests** — all dependencies bundled; PDF worker served as static asset
5. **No localStorage of file data** — only settings and theme preference

### 17.2 Security Headers (via Vercel)

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |

### 17.3 In-App Security

- **ObjectURL cleanup**: Every created ObjectURL is tracked in `urlsRef` and revoked on unmount
- **PDF buffer safety**: `slice(0)` passed to pdfjs to preserve original File for retries
- **Filename sanitization**: `sanitizeFileName()` strips illegal OS characters
- **Error isolation**: Per-file errors don't halt batch processing
- **Regex safety**: Invalid user-supplied regex is caught and silently ignored

---

## 18. Known Tech Debt & Limitations

### 18.1 TypeScript Strictness

`strict: false`, `noImplicitAny: false`, `strictNullChecks: false` — intentionally relaxed for prototyping.

### 18.2 Unused Dependencies

Several packages installed but not consumed:
- `@tanstack/react-query` (QueryClient mounted in App.tsx but no queries used)
- `zod`, `react-hook-form`, `@hookform/resolvers` (installed for future forms)
- `date-fns` (renamer has its own formatDate)
- `recharts`, `react-day-picker`, `react-resizable-panels`, `embla-carousel-react`, `cmdk`, `vaul`, `input-otp` — shadcn peer deps, not used
- 30+ unused shadcn/ui primitive components

### 18.3 Image Tool Limitations

- **EXIF orientation ignored**: `getExifOrientation` is a stub returning `1`. iPhone portrait photos may appear rotated.
- **Animated GIF → static**: Canvas re-encoding loses animation. Toast warns the user.
- **`progressive`, `embedColorProfile`, `preserveMetadata`**: These settings exist in the `ProcessSettings` type but have no UI controls.
- **HEIC input not supported**: iPhone HEIC photos need conversion before upload.

### 18.4 PDF Tool Limitations

- **Text layer lost**: Output pages are JPEG images; text is not selectable.
- **pdfjs worker**: `pdf.worker.min.mjs` is 1.2 MB, loaded as static asset.
- **Smart recommendation is heuristic**: Based on first-page analysis only; multi-page PDFs may get suboptimal recommendations.

### 18.5 Renamer Limitations

- **No drag-to-reorder rules**: Only Up/Down buttons.
- **No rule preset saving**: Can't save/load rule pipelines from localStorage.
- **No regex tester**: Find field is plain text input; no test UI.
- **Unicode grapheme clusters**: `reverse` rule may break multi-byte characters.

### 18.6 Cross-cutting

- **No PWA**: No service worker, no manifest, no offline support.
- **No i18n**: English-only UI.
- **No CSP meta tag**: `Content-Security-Policy` not set in HTML.
- **No E2E tests**: Only pure-function unit tests exist.
- **No component or hook tests**: Only engine utilities are tested.

---

## 19. Future Roadmap

### 19.1 Image Tool

1. **Honor EXIF orientation** — Implement proper EXIF parsing via `DataView` on the file array buffer, read tag `0x0112`, apply rotation/flip from EXIF orientation values 1-8.
2. **HEIC input support** — Use `heic2any` for decoding iPhone HEIC photos.
3. **Animated WebP output** — Re-encode animated GIFs as animated WebP using frame extraction.
4. **Per-iteration target-KB feedback** — Show "Trying 80%… Trying 70%…" during iterative target-size loop.
5. **Clean up unused ProcessSettings** — Remove `progressive`, `preserveMetadata`, `embedColorProfile` from the type if no UI will exist.

### 19.2 PDF Tool

1. **Smarter per-page analysis** — Classify each page individually for quality scaling (text pages get higher quality, image pages get lower).
2. **Preserve text layer where possible** — Use pdf-lib to modify source PDF directly (strip duplicate images, recompress streams) instead of full re-rasterization.
3. **Blank page detection** — Skip or remove pages that are entirely white or near-white.

### 19.3 Renamer

1. **Drag-to-reorder rules** — Replace Up/Down buttons with drag handle + dnd-kit.
2. **Rule preset save/load** — Persist rule pipelines to localStorage with named presets.
3. **Regex tester** — Inline test input to preview regex matches.
4. **Per-rule live hover preview** — Preview effect of a single rule on hover.

### 19.4 Cross-cutting

1. **PWA support** — Add manifest.json, service worker with cache-first strategy, vite-plugin-pwa.
2. **i18n** — react-i18next integration for multi-language support (hi, mr, fr, es, de, ja, zh).
3. **Component tests** — Add RTL tests for key components (UploadZone, SettingsPanel, ComparisonView, RuleBuilder).
4. **Hook tests** — Test useImageUpload validation flow, useFileRename plan computation, usePdfUpload metadata extraction.
5. **E2E tests** — Playwright or Cypress for critical user flows.
6. **Remove unused deps** — Prune unused shadcn/ui primitives and their @radix-ui peers (30+ components, ~20 packages).
7. **Add proper CSP** — `Content-Security-Policy` meta tag for defense-in-depth.
8. **`aria-live` regions** — Better accessibility announcements for processing progress and state changes.

---

## Appendix: Key File Reference

| File | Lines | Purpose |
|---|---|---|
| `src/App.tsx` | 99 | Provider stack, routes, ErrorBoundary, lazy analytics |
| `src/index.css` | 410 | Theme CSS variables, Tailwind extensions, custom utilities |
| `src/config/seo.ts` | 465 | Per-page SEO registry (8 pages, full JSON-LD) |
| `index.html` | 990 | SEO metadata, 9 JSON-LD blocks, theme bootstrap |
| `src/utils/imageProcessor.ts` | 796 | Canvas pipeline, format detection, recommendation, filename tokens |
| `src/utils/fileRenamer.ts` | 509 | 13-rule engine, rename plan builder, sanitizeFileName |
| `src/utils/pdfProcessor.ts` | 525 | pdfjs → JPEG → pdf-lib, smart recommendation, thumbnail gen |
| `src/pages/About.tsx` | 1687 | Full story, stats, philosophy, timeline, profile |
| `src/components/FileRenameRuleBuilder.tsx` | 845 | 13-rule UI, per-rule editors, add/remove/reorder |
| `src/components/ComparisonView.tsx` | 649 | Side/Slider/Toggle before-after with zoom/pan/keyboard |
| `src/components/SettingsPanel.tsx` | ~400 | 4-tab settings UI with social presets, filename tokens |
| `src/hooks/useImageUpload.ts` | ~350 | Image batch state machine, validation, ObjectURL lifecycle |
| `src/hooks/useSettings.ts` | ~150 | Persistent settings with aspect-aware dimension computation |
| `tailwind.config.ts` | 75 | CSS-var color mapping, Inter font, custom keyframes |
| `vite.config.ts` | 72 | SWC plugin, manualChunks, @ alias, port 8080 |
| `vercel.json` | 81 | SPA rewrites, cache headers, security headers |
