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
| **Image Compressor / Resizer / Converter** | `/` | Compress up to 10 images at a time, resize with social-media presets, convert to WebP/AVIF/JPEG/PNG, rotate, mirror, grayscale, strip EXIF, target a specific KB size | `browser-image-compression`, HTML5 Canvas, `URL.createObjectURL` |
| **PDF Compressor** | `/compress-pdf` | Compress up to 5 PDFs (each up to 100 MB) by re-rendering every page as a JPEG and rebuilding the PDF | `pdfjs-dist` (parsing + rasterizing), `pdf-lib` (rebuilding) |
| **Bulk File Renamer** | `/bulk-rename` | Add up to 100 files, build a stack of 13 different rename rules, see a live preview, download everything as a ZIP | `JSZip`, `file-saver` |

The marketing site also has:
- `/about` — mission, values, what the tool does
- `/contact` — contact cards + social links
- `/privacy` — privacy policy (last updated March 8, 2026)
- `/terms` — terms of service (last updated March 8, 2026)
- `*` (NotFound) — 404 page

**Brand identity:** Indigo (`hsl(229 80% 45%)`) primary, Teal (`hsl(170 75% 35%)`) accent. Light + Dark mode (dark is default). Gradient brand text uses `linear-gradient(135deg, #4F46E5, #0D9488)`. Font: **Inter** (loaded from Google Fonts). The ⚡ emoji is the logo.

---

## 2. Tech Stack & Tooling

### 2.1 Runtime dependencies (`package.json`)

| Package | Why it's here |
|---|---|
| `react@^18.3.1` + `react-dom@^18.3.1` | UI framework |
| `react-router-dom@^6.30.1` | Client-side routing (BrowserRouter in `App.tsx`) |
| `vite@^5.4.19` + `@vitejs/plugin-react-swc@^3.11.0` | Dev server + build tool (uses SWC for fast refresh) |
| `typescript@^5.8.3` | Types (strict mode is OFF in `tsconfig.app.json` — intentional) |
| `tailwindcss@^3.4.17` + `tailwindcss-animate@^1.0.7` | Styling (CSS variables for theming) |
| `@tanstack/react-query@^5.83.0` | Installed and wrapped in `QueryClientProvider` in `App.tsx` but **not actively used** in the current feature set — it's there for future server-backed features (or kept from the starter) |
| `framer-motion@^12.38.0` | All UI animations (hero blobs, queue item transitions, modal springs, etc.) |
| `lucide-react@^0.462.0` | Icon library (CloudUpload, Sparkles, Zap, Shield, X, Loader2, Check, AlertCircle, RotateCcw, Plus, Download, RefreshCw, ImageIcon, FileArchive, Share2, Eye, FileText, Hash, etc.) |
| `sonner@^1.7.4` | Toast notifications (used in every hook) |
| `next-themes@^0.3.0` | Theme resolution (used by `components/ui/sonner.tsx`) |
| `browser-image-compression@^2.0.2` | Heavy lifting for the image path when no transforms are needed (workers + smart re-encoding) |
| `pdf-lib@^1.17.1` | Rebuilds compressed PDFs from rasterized pages |
| `pdfjs-dist@^6.0.227` | Parses the source PDF and renders each page to a canvas (worker file lives at `public/pdf.worker.min.mjs`) |
| `jszip@^3.10.1` | Builds the bulk-rename ZIP and the multi-file download ZIP |
| `file-saver@^2.0.5` | Triggers a browser download from a `Blob` |
| `zod@^3.25.76` | Installed but not currently consumed (kept for future form/validation use) |
| `react-hook-form@^7.61.1` + `@hookform/resolvers@^3.10.0` | Installed but not currently consumed (kept for future form/validation use) |
| `date-fns@^3.6.0` | Installed but not currently consumed (the date rule in the file renamer uses its own `formatDate`) |
| `recharts@^2.15.4`, `react-day-picker@^8.10.1`, `react-resizable-panels@^2.1.9`, `embla-carousel-react@^8.6.0`, `cmdk@^1.1.1`, `vaul@^0.9.9`, `input-otp@^1.4.2` | shadcn/ui peer deps — installed but **none of these widgets are used in the current pages** |
| `class-variance-authority@^0.7.1`, `clsx@^2.1.1`, `tailwind-merge@^2.6.0` | Required by the shadcn/ui `cn()` helper at `src/lib/utils.ts` |
| Every `@radix-ui/react-*` package in the dep list | Required by the corresponding shadcn/ui primitive in `src/components/ui/`. The app only **directly** consumes: `slider`, `tabs`, `switch`, `tooltip`, `dialog`, `sonner`, `toast`, `popover`, `select`, `label`, `button`, `input`, `badge`, `accordion` |

### 2.2 Dev dependencies (test infra)

- `vitest@^3.2.4` + `jsdom@^20.0.3` + `@testing-library/react@^16.0.0` + `@testing-library/jest-dom@^6.6.0`
- `eslint@^9.32.0` (flat config in `eslint.config.js`) + `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- `lovable-tagger@^1.1.13` — adds a dev-only plugin in `vite.config.ts` (only in dev mode) for component tagging; **remove or leave in dev only**

### 2.3 NPM scripts

```json
"dev": "vite"                  // dev server on 0.0.0.0:8080
"build": "vite build"          // production build → dist/
"build:dev": "vite build --mode development"
"lint": "eslint ."
"preview": "vite preview"
"test": "vitest run"           // CI-friendly: runs once
"test:watch": "vitest"         // watch mode
```

The repo also has `bun.lock` and `bun.lockb` (uses Bun as a possible package manager), `package-lock.json` (npm fallback), and a `dist/` build output.

### 2.4 Config files

- **`vite.config.ts`** — alias `@` → `./src`, dev server on port **8080**, HMR overlay disabled (so the canvas/preview errors don't block the user), `lovable-tagger` is only injected in dev mode.
- **`vitest.config.ts`** — `jsdom` env, globals, `setupFiles: ./src/test/setup.ts`, alias `@` mirrors the Vite one.
- **`tailwind.config.ts`** — `darkMode: ['class']`, custom `container`, custom colors all bound to CSS variables (defined in `src/index.css` under `:root` and `.dark`), custom keyframes (`accordion-down`, `pulse-glow`, `fade-in-up`), `fontFamily.sans: Inter`.
- **`tsconfig.json`** (root) — references `tsconfig.app.json` and `tsconfig.node.json`. `strictNullChecks: false` and `noImplicitAny: false` are intentionally relaxed.
- **`tsconfig.app.json`** — `strict: false`, `target: ES2020`, `jsx: react-jsx`, `types: ["vitest/globals"]`. Path alias `@/* → ./src/*`.
- **`tsconfig.node.json`** — for `vite.config.ts`, `strict: true`.
- **`eslint.config.js`** — flat config: browser globals, `react-hooks` + `react-refresh`, `@typescript-eslint/no-unused-vars: off` (intentionally lenient for prototyping).
- **`postcss.config.js`** — `tailwindcss` + `autoprefixer`.
- **`components.json`** — shadcn/ui config (style: default, RSC: false, baseColor: slate, css variables: true).
- **`index.html`** — heavy SEO setup (see §14).

### 2.5 Path alias

`@` → `src`. Used everywhere (`@/components/...`, `@/hooks/...`, `@/utils/...`, `@/lib/utils`, `@/contexts/ThemeContext`).

---

## 3. Directory Map

```
image-squeeze-express/
├── index.html                       # SEO + theme bootstrap + root mount
├── package.json
├── vite.config.ts                   # @ alias, port 8080, lovable-tagger (dev only)
├── vitest.config.ts                 # jsdom + @ alias + setupFiles
├── tailwind.config.ts               # Custom CSS-var colors, animations
├── tsconfig.{json,app,node}.json
├── eslint.config.js                 # Flat config, lenient
├── postcss.config.js
├── components.json                  # shadcn/ui config
├── public/
│   ├── favicon.ico
│   ├── pdf.worker.min.mjs           # pdfjs worker (loaded via /pdf.worker.min.mjs)
│   ├── placeholder.svg
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── main.tsx                     # ReactDOM.createRoot mount
│   ├── App.tsx                      # Providers + routes (lazy-loaded)
│   ├── index.css                    # Tailwind + theme CSS variables + custom utilities
│   ├── vite-env.d.ts
│   ├── components/                  # 21 app-level components
│   │   ├── ui/                      # 49 shadcn/ui primitives (most unused, see §2.1)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── UploadZone.tsx
│   │   ├── ImageQueue.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── ResultsSection.tsx
│   │   ├── SocialPresetsGrid.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── FeaturesGrid.tsx
│   │   ├── FAQSection.tsx
│   │   ├── ProTeaser.tsx
│   │   ├── PageDropOverlay.tsx
│   │   ├── LazySection.tsx
│   │   ├── NavLink.tsx
│   │   ├── PdfUploadZone.tsx
│   │   ├── PdfQueue.tsx
│   │   ├── PdfSettingsPanel.tsx
│   │   ├── PdfResultsSection.tsx
│   │   ├── FileRenameUploadZone.tsx
│   │   ├── FileRenameRuleBuilder.tsx
│   │   └── FileRenamePreviewList.tsx
│   ├── contexts/
│   │   └── ThemeContext.tsx         # dark/light toggle, persists to localStorage
│   ├── hooks/                       # 8 custom hooks
│   │   ├── useImageUpload.ts        # State machine for image batch (the big one)
│   │   ├── usePdfUpload.ts          # State machine for PDF batch
│   │   ├── useFileRename.ts         # State machine for renamer + ZIP building
│   │   ├── useSettings.ts           # Compression settings + localStorage persistence
│   │   ├── useClipboardPaste.ts     # Listens for paste events at document level
│   │   ├── usePageDropZone.ts       # Tracks drag state + collects dropped files
│   │   ├── use-toast.ts             # Radix toast reducer
│   │   └── use-mobile.tsx           # Detects < 768px viewport
│   ├── lib/
│   │   └── utils.ts                 # `cn()` (clsx + tailwind-merge)
│   ├── pages/                       # 8 route components
│   │   ├── Index.tsx                # Home (image tool)
│   │   ├── CompressPdf.tsx          # PDF tool
│   │   ├── BulkRename.tsx           # Renamer tool
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── PrivacyPolicy.tsx
│   │   ├── TermsOfService.tsx
│   │   └── NotFound.tsx
│   ├── utils/                       # Pure logic (the "engine")
│   │   ├── imageProcessor.ts        # Canvas-based image pipeline
│   │   ├── pdfProcessor.ts          # pdfjs → JPEGs → pdf-lib
│   │   ├── fileRenamer.ts           # Pure rename rule engine
│   │   └── batchValidation.ts       # Pure batch validation (referenced via useImageUpload)
│   └── test/
│       ├── setup.ts                 # matchMedia polyfill + jest-dom
│       ├── example.test.ts
│       ├── imageProcessor.test.ts   # Pure-function unit tests
│       ├── pdfProcessor.test.ts
│       └── fileRenamer.test.ts
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
<QueryClientProvider client={queryClient}>
  <ThemeProvider>                    // dark/light, persisted to localStorage('ls-image-compressor-theme')
    <TooltipProvider>                 // Radix tooltip root
      <Toaster />                     // Radix toast viewport (legacy)
      <Sonner />                      // Sonner toast viewport (the one actually used)
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes>
            <Route path="/" element={<Index />} />          // eager (main feature)
            <Route path="/compress-pdf" element={<CompressPdf />} /> // lazy
            <Route path="/bulk-rename" element={<BulkRename />} />   // lazy
            <Route path="/about" element={<About />} />              // lazy
            <Route path="/contact" element={<Contact />} />          // lazy
            <Route path="/privacy" element={<PrivacyPolicy />} />    // lazy
            <Route path="/terms" element={<TermsOfService />} />     // lazy
            <Route path="*" element={<NotFound />} />                // lazy
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
```

> **Performance note:** `Index` is the only non-lazy route because it's the landing page. All other pages are split off via `React.lazy`. The `Suspense` fallback is a blank colored div so there's no flash of unstyled content.

### 4.3 `src/contexts/ThemeContext.tsx`

- Context value: `{ darkMode: boolean, toggleDarkMode: () => void }`
- Initial value is read from `localStorage['ls-image-compressor-theme']`; default is `true` (dark) if missing.
- On every change, toggles `document.documentElement.classList.toggle('dark', darkMode)` and writes back to `localStorage`.
- `index.html` has an **inline script** that reads `localStorage.ls-image-compressor-theme` *before React mounts* and toggles the `dark` class on `<html>` — this prevents the dark→light flash on reload.

---

## 5. The Image Compressor (Home Page)

### 5.1 Page: `src/pages/Index.tsx`

Composes the entire image tool. Reads the following hooks/state:
- `useImageUpload()` — file queue, processing state, per-file results
- `useSettings()` — compression config (persisted to `localStorage['ls-image-compressor-settings']`)
- `useClipboardPaste({ onPaste: addFiles })` — accepts Ctrl+V image pastes anywhere
- `usePageDropZone({ onDrop: addFiles })` — full-page drag-drop overlay

Layout:
```
<Header />                             // from components/Header
<main>
  <HeroSection onFilesSelected={addFiles} imageCount={files.length}>
    {/* children injected below: */}
    {hasFiles && <SettingsPanel ... />}
    <ImageQueue ... />
  </HeroSection>

  {allDone && processedFiles.length > 0 && (
    <Suspense fallback={null}>
      <ResultsSection files={processedFiles} onReset={clearAll} />
    </Suspense>
  )}

  <Suspense fallback={null}>
    <LazySection id="social-presets"><SocialPresetsGrid ... /></LazySection>
    <LazySection><HowItWorks /></LazySection>
    <LazySection><FeaturesGrid /></LazySection>
    <LazySection><ProTeaser /></LazySection>
    <LazySection><FAQSection /></LazySection>
    <Footer />
  </Suspense>
</main>
<PageDropOverlay visible={isDragging} />
```

The `sourceDims` array (`files.filter(f => f.originalWidth > 0).map(...))` is passed to `SettingsPanel` so the panel can compute aspect-ratio-aware width/height derivations in real time.

`handleAddMore` scrolls back to the upload zone and programmatically clicks the hidden `<input type="file" accept^="image">` (selected by attribute selector since there is only one image input on the page).

### 5.2 `HeroSection` (`src/components/HeroSection.tsx`)

Full-viewport hero (`min-h-[100svh]`) with:
- Layered radial-gradient mesh background (4 ellipses in primary/accent colors)
- Four floating blurred shapes animated with `framer-motion` (looping y/x/scale keyframes, durations 18-25s)
- Headline: "Compress Images **Up to 90%** Instantly & Privately" (gradient text)
- Subhead, trust badges (🔒 100% Private, ⚡ Instant, 🆓 Free Forever, 📦 Batch (10))
- The `<UploadZone>` in a `motion.div` with staggered fade-in
- `children` are passed through for the queue + settings to be injected

### 5.3 `UploadZone` (`src/components/UploadZone.tsx`)

The reusable drag/drop + click-to-upload zone. Props:
```ts
{ onFilesSelected: (files: FileList | File[]) => void, imageCount: number, maxFiles?: number = 10 }
```
- `accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/bmp"`
- `disabled` state when `imageCount >= maxFiles` (visually fades to 60% opacity, no pointer events)
- Keyboard accessible: `role="button"`, `tabIndex`, Enter/Space to open file dialog
- Drop handlers propagate to `onFilesSelected`
- Hidden `<input ref={inputRef} multiple>` is the underlying file picker
- Submits to the hook → `addFiles(...)` → see §5.6

### 5.4 `SettingsPanel` (`src/components/SettingsPanel.tsx`)

Tabbed UI (Radix Tabs) with 4 tabs: **Compress / Resize / Format / More**. Inputs all flow back to `useSettings` via `onUpdate(partial)` etc.

#### Tab 1 — Compress
- **4 quick presets** (max=100, high=90, balanced=75, compact=50) — clicking calls `applyQualityPreset(p)`
- **Quality slider** (Radix Slider) 10–100, default 75. If `autoOptimize` is on, displays "Auto" instead of the number
- **Auto Optimize switch** — when toggled, sets `qualityPreset: 'balanced' | 'custom'`
- **Target File Size** — numeric input (KB). When filled, autoOptimize is forced on. The processor will iteratively reduce quality to hit the target (see §5.7)

#### Tab 2 — Resize
- Two numeric inputs (Width, Height) — `onSetWidth`/`onSetHeight` use `computeAspectDimensions(...)` to auto-derive the missing dimension from the source's aspect ratio (only when the lock is on)
- **Aspect lock toggle** (`Link2` / `Unlink2` icon button between the inputs)
- **9 Social Media Presets**: IG Post (1080²), IG Story (1080×1920), LinkedIn (1200×627), LI Banner (1584×396), WhatsApp (500²), Twitter (1200×675), FB Cover (820×312), YT Thumb (1280×720), Full HD (1920×1080). Clicking a preset writes `{ width, height, selectedPreset: 'ig-post' | ... }`

#### Tab 3 — Format
- 5 format options (WebP ⭐Best, AVIF, JPEG, PNG, Keep Original)
- Each option runs `isFormatSupported('image/...')` against the browser. If unsupported, the button is disabled with a tooltip pointing to the right browser version
- Click writes `outputFormat: 'webp' | 'avif' | 'jpeg' | 'png' | 'original'`

#### Tab 4 — More (advanced)
- **Rotation**: 0°/90°/180°/270° grid
- **Mirror / Flip** switch
- **Grayscale** switch (uses the BT.601 luma transform: `0.299 R + 0.587 G + 0.114 B`)
- **Strip EXIF Data** switch — **always-on in practice** since `browser-image-compression` always strips metadata by default; the switch is more of a user-facing hint. The switch **does** force a canvas re-encode (see §5.7 logic)
- **Progressive JPEG** switch — **user-facing hint only**; `canvas.toBlob` doesn't expose progressive JPEG encoding, so the switch is essentially a "we tried" placeholder
- **Reset all settings** button (calls `useSettings.resetAll`)

### 5.5 `ImageQueue` (`src/components/ImageQueue.tsx`)

The file grid + per-file card. Renders nothing if `files.length === 0`.

Per-file card shows:
- 56×56 thumbnail (the original `preview` URL, or the `processedPreview` URL once done)
- Status overlays: spinner (processing) / green checkmark (done) / red alert (error)
- Truncated file name (e.g. `very-long-name…JPG` with a smart truncate that preserves the extension)
- Size + dimensions (`originalWidth × originalHeight`)
- Once done: `newSize · ▼ N%` (uses `getCompressionRatio`)
- Once error: red error text (truncated, with full text in `title` for hover)
- A status badge (Ready/Processing/Done/Failed)
- A retry button (RotateCcw) appears when `status === 'error'` and not currently processing
- A remove (X) button in the corner, visible on hover or when failed

Above the grid:
- "N files" with "N done" and "N failed" sub-badges
- Add (programmatically opens the file input) + Clear (calls `onClearAll`)
- Animated progress bar (gradient + shimmer overlay) when `isProcessing`. Shows `processingText` (e.g. "Processing 3 of 10…") and `progress%`

Below the grid:
- Single "Compress N images" gradient button (only when `!allDone && readyCount > 0`)

### 5.6 `useImageUpload` hook (`src/hooks/useImageUpload.ts`)

The state machine for the image tool. All UI components call into this hook.

**State:**
```ts
files: UploadedFile[]       // the queue
isProcessing: boolean
progress: number            // 0..100, total across the batch
processingText: string      // human-readable status
currentItem: string | null  // id of the file currently being processed
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
  result?: ProcessResult;      // { blob, width, height, sizeBytes, reduction }
  processedFile?: File;        // = toDownloadFile(...)
  processedPreview?: string;   // ObjectURL for the result
}
```

**Constants:**
```ts
export const MAX_FILES = 10;                  // hard cap
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB per file
```
> Note: `MAX_FILE_SIZE` is exported and used by `utils/batchValidation.ts` (which is **declared but not currently imported** anywhere — see "Tech Debt" below).

**Object URL lifecycle:**
- `urlsRef = useRef<Set<string>>(new Set())` tracks every ObjectURL we create
- `revokeUrl(url)` removes from the set and calls `URL.revokeObjectURL`
- On unmount, all tracked URLs are revoked

**Methods:**

| Method | Behavior |
|---|---|
| `addFiles(fileList)` | Filters to `image/*` types; warns for `>10 MB` files and animated GIFs (which become static after Canvas re-encode); truncates at `MAX_FILES`; generates UUIDs; resolves original dimensions async (best-effort, doesn't fail) |
| `removeFile(id)` | Revokes both `preview` and `processedPreview` ObjectURLs, removes from queue |
| `retryFile(id, settings)` | Resets status to `ready`, calls `processFiles([id], settings)` |
| `clearAll()` | Revokes every ObjectURL, empties the queue, resets progress |
| `resetFile(id)` | Strips the result/preview, reverts to `ready` (used if you want to re-compress a single file with new settings) |
| `processAll(settings)` | Collects all files with `status === 'ready' | 'error'`, revokes their old `processedPreview` ObjectURLs, then calls `processFiles(ids, settings)` |
| `processFiles(ids, settings)` | The big one — see below |

**`processFiles` flow:**
1. Snapshot the targets via a `setFiles((c) => { targets = c.filter(...); return c; })` trick (a known React pattern to "read" current state without subscribing)
2. Yield to React (`await Promise.resolve()`) so any pending status updates can apply first
3. Mark every target's status as `processing`
4. For each target, sequentially:
   - Update `currentItem` and `processingText`
   - Call `processImage(item.file, settings, item.originalSize)` (see §5.7)
   - On success: store the `result`, `processedFile` (= `toDownloadFile(name, blob)`), `processedPreview` (= ObjectURL for the blob). Increment `successCount`
   - On error: store the `error` message, set status to `error`. Increment `errorCount`
   - Increment completed, update `progress = round(completed/total * 100)`
5. After the loop, fire a single `toast`:
   - `success === 0` errors → `toast.error('❌ All N images failed')`
   - `success > 0` and `error > 0` → `toast.warning('⚠️ X succeeded, Y failed')`
   - all success → `toast.success('✅ All N images processed successfully!')`

**Derived state (memos):**
- `hasFiles = files.length > 0`
- `allDone = files.length > 0 && files.every(f => f.status === 'done' || f.status === 'error')`
- `processedFiles = files.filter(f => f.status === 'done')`
- `hasErrors = files.some(f => f.status === 'error')`
- `readyCount = files.filter(f => f.status === 'ready' || f.status === 'error').length`

### 5.7 `utils/imageProcessor.ts` — the image engine

This is pure logic; it has no React dependencies. It's the heart of the image tool.

**Exports:**
- Types: `ImageFormat`, `QualityPreset`, `Rotation`, `ProcessSettings`, `ProcessResult`
- Functions: `formatFileSize`, `getCompressionRatio`, `getImageDimensions`, `toMime`, `toExt`, `isFormatSupported`, `calcDimensions`, `processImage`, `toDownloadFile`, `calculateOptimalQuality`, `estimateQualityForSize`, `getExifOrientation`

**`ProcessSettings` shape (mirrors `useSettings`):**
```ts
{
  quality: number;           // 10..100
  autoOptimize: boolean;
  targetSizeKB: number | null;

  width: number | null;
  height: number | null;
  lockAspectRatio: boolean;

  outputFormat: 'jpeg' | 'png' | 'webp' | 'avif' | 'original';

  stripEXIF: boolean;
  grayscale: boolean;
  rotation: 0 | 90 | 180 | 270;
  mirror: boolean;
  preserveMetadata: boolean;
  progressive: boolean;
  embedColorProfile: boolean;
}
```

**`processImage(file, settings, originalSize)` algorithm:**

1. `outputMime = toMime(settings.outputFormat, file.type)` — for `'original'`, round-trips `image/png|jpeg|webp|avif`; falls back to `image/png` for GIF/BMP/TIFF
2. Read original dimensions via `getImageDimensions(file)` (creates a temp `Image`, waits for `onload`, reads `naturalWidth/Height`, revokes the ObjectURL)
3. Compute target dimensions and an optional crop rectangle:
   ```ts
   const { w, h, crop } = calcDimensions(origW, origH, settings.width, settings.height, settings.lockAspectRatio);
   ```
   - If neither width nor height is set → return original dims, no crop
   - If only one is set AND lock is on → derive the other from source aspect
   - If both are set → return them as-is, but if source and target aspect ratios differ (epsilon 0.001), produce a center-crop rectangle:
     - Source is wider than target → crop sides equally (`cropW = origH * targetAspect`, `cropX = (origW - cropW)/2`)
     - Source is taller → crop top/bottom
4. Determine if we need the canvas path:
   - `hasTransforms = rotation || mirror || grayscale || stripEXIF`
   - `needsResize = targetW !== origW || targetH !== origH`
   - `needsFormatChange = outputMime !== file.type`
5. Compute the quality to use:
   - If `autoOptimize` is on → `calculateOptimalQuality(originalSize, targetSizeKB, outputFormat, hasTransforms)` (see below)
   - Otherwise → `settings.quality`
6. **If any of hasTransforms / needsResize / needsFormatChange:**
   - Call `canvasProcess(file, targetW, targetH, outputMime, quality, { rotation, mirror, grayscale, crop })`
   - **If `targetSizeKB` is set**, run an iterative loop (max 5 iters, decrement quality by 10 each time, floor at 10) to shrink until the blob fits
7. **Otherwise** (i.e. original format, original dimensions, no transforms):
   - Delegate to `imageCompression(file, { maxSizeMB, maxWidthOrHeight, useWebWorker: true, fileType, initialQuality, alwaysKeepResolution: true })` — this is the fast path that uses Web Workers

**`canvasProcess(source, w, h, mime, quality, options)` (private):**
1. `loadImage(source)` — same as `getImageDimensions` but returns the `Image`
2. Create an offscreen `<canvas>` at the right size
   - For 90°/270° rotation, swap width/height so the rotated image fits
3. Get a 2D context. Enable `imageSmoothingEnabled = true`, `imageSmoothingQuality = 'high'`
4. If output is JPEG, fill white first (avoids transparency artifacts)
5. If there's a crop, sample only the crop rectangle; otherwise the full image
6. If rotation or mirror is set, translate the origin to the canvas center, then `ctx.scale(-1, 1)` for mirror and/or `ctx.rotate(deg * PI / 180)` for rotation, then draw at the correct offset
7. If grayscale, apply BT.601 luma transform pixel-by-pixel
8. `canvas.toBlob(callback, mime, quality/100)` — quality is clamped to `[0.1, 1]`

**`calcDimensions(origW, origH, targetW, targetH, lock)`** — the social-media-preset-aware dimension math. Returns `{ w, h, crop? }`. This is what the `ImageQueue`'s "no distortion" guarantee relies on.

**`isFormatSupported(mime)`** — feature-detects browser support for a given output MIME by trying `canvas.toDataURL(mime)`. Cached in a `Map<string, boolean>`. Returns `false` if there's no `document` (SSR/test).

**`toMime(format, originalType)`** — see step 1 above.

**`toExt(mime)`** — `'image/webp' → '.webp'`, `'image/png' → '.png'`, `'image/avif' → '.avif'`, else `'.jpg'`.

**`toDownloadFile(originalName, blob)`** — builds a `File` named `ls-image-compressor_<base>.<ext>` with the right MIME.

**`calculateOptimalQuality(originalSize, targetSizeKB, outputFormat, hasTransforms)`:**
- If `targetSizeKB` set:
  - `ratio = targetBytes / originalSize`
  - `ratio >= 0.9 → 95`, `>= 0.7 → 82`, `>= 0.5 → 68`, `>= 0.3 → 50`, else `35`
- Else if `webp` → `hasTransforms ? 80 : 75`
- Else if `avif` → `hasTransforms ? 70 : 65` (AVIF compresses better → lower number)
- Else if `png` → `100` (lossless)
- Else → `80`

**`getExifOrientation(file)`** — currently a stub returning `1`. The processor doesn't honor EXIF orientation — users must rotate manually. **This is a known limitation worth fixing (see "Suggested Improvements" below).**

### 5.8 `useSettings` hook (`src/hooks/useSettings.ts`)

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

  preserveMetadata: false, progressive: true, embedColorProfile: false,
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

### 5.9 `ResultsSection` (`src/components/ResultsSection.tsx`)

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
  - Clicking either thumbnail opens a `Dialog` with a side-by-side `ComparisonView`
- **Download All as ZIP** button (gradient, full-width on mobile). If only 1 file, just downloads it directly. ZIP filename: `ls-image-compressor_batch.zip`
- **Process More Images** ghost button — calls `onReset` (= `clearAll`)
- **Share** row: Twitter / X, WhatsApp, Copy Link

**`useCountUp(target, duration = 800)`** — small custom hook that runs a `requestAnimationFrame` loop using `1 - (1-t)^3` easing. Resets when the target changes.

### 5.10 `SocialPresetsGrid` (`src/components/SocialPresetsGrid.tsx`)

Section under the hero. A **live crop preview** that visualizes the active social-media preset's aspect ratio over an inline SVG landscape.

- 6 platforms (IG Post, LinkedIn, WhatsApp DP, Twitter/X, FB Cover, YT Thumb) — note this is a **slightly different set** from the 9 in `SettingsPanel` (SettingsPanel adds IG Story, LI Banner, Full HD, and renames a couple)
- On hover/click a platform: a white-bordered crop frame with corner markers appears, plus a platform label, an aspect-ratio badge (computed via GCD), and a description
- Clicking: applies the preset (`onSelectPreset(w, h, id)`) → sets `width`, `height`, `selectedPreset` in `useSettings`, shows a toast, then smooth-scrolls back to `#upload`

### 5.11 `HowItWorks`, `FeaturesGrid`, `FAQSection`, `ProTeaser`

Landing-page sections, all `IntersectionObserver`-driven fade-ins, no state. `ProTeaser` is the only one with state — it has a "Join Waitlist" `Dialog` that just appends the email to `localStorage['ls-image-compressor-waitlist']` (no backend).

### 5.12 `PageDropOverlay` (`src/components/PageDropOverlay.tsx`)

The full-page overlay shown when files are being dragged anywhere on the document (not just inside the upload zone). `z-40` (below the header's `z-50`). Pointer-events disabled — it doesn't intercept the drop, the `usePageDropZone` hook does the actual collection.

### 5.13 `LazySection` (`src/components/LazySection.tsx`)

Generic wrapper that only mounts its `children` when it scrolls within 200px of the viewport. Reserves `minHeight` (default 200px) before mounting to prevent layout shift. Used for all the below-the-fold sections on the home page.

---

## 6. The PDF Compressor (`/compress-pdf`)

### 6.1 Page: `src/pages/CompressPdf.tsx`

Standalone page (not lazy — actually it IS lazy in `App.tsx`). Layout:
```
<Header />
<main>
  <section className="min-h-[100svh]"> {/* identical gradient background + floating badges to HeroSection */}
    <motion.h1>Compress PDFs <gradient>Up to 90%</gradient> Smaller & Free</motion.h1>
    <motion.p>...</motion.p>
    <motion.div trust badges: 🔒 ⚡ 🆓 📦 Batch (5) />
    <div ref={uploadRef}>
      <PdfUploadZone onFilesSelected={addFiles} pdfCount={files.length} />
    </div>
    {hasFiles && <PdfSettingsPanel preset={preset} onPresetChange={setPreset} quality={quality} onQualityChange={setQuality} />}
    <PdfQueue ... />
  </section>

  {allDone && processedFiles.length > 0 && <PdfResultsSection files={processedFiles} onReset={clearAll} />}

  <HowItWorksPdf />     // inline component at the bottom of this file
  <FeaturesPdf />        // inline
  <FaqPdf />             // inline
  <Footer />
</main>
<PageDropOverlay visible={isDragging} />
```

`useClipboardPaste` and `usePageDropZone` are both filtered to only accept PDFs (`f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')`).

The page also has **3 inline components** at the bottom (`HowItWorksPdf`, `FeaturesPdf`, `FaqPdf`) — duplicated copy of the marketing-style steps for PDF. Plus an inline `PageDropOverlayPdf` wrapper.

### 6.2 `PdfUploadZone`, `PdfQueue` (1:1 mirror of the image versions)

`PdfUploadZone` is identical to `UploadZone` but with `accept="application/pdf,.pdf"`, maxFiles=5, maxFile=100 MB, and a `FileText` icon.

`PdfQueue` is similar to `ImageQueue` but:
- No image preview — uses a `FileText` icon
- Shows the **page count** (resolved async via `getPdfPageCount`)
- Shows a **per-file progress bar** while processing (because each PDF has many pages and we get per-page progress from the processor)
- Renders as a single column (not 2-col grid like images)

### 6.3 `PdfSettingsPanel` (`src/components/PdfSettingsPanel.tsx`)

Simpler than the image version:
- 3 preset buttons: **Strong (low, q=0.4)** / **Balanced (medium, q=0.6)** / **Light (high, q=0.82)** — each with an icon (Rocket/Zap/BadgeCheck)
- A quality slider 10–95% that maps to the 0..1 JPEG quality range. Editing it switches the preset to `'custom'`
- A small note: "Compression happens entirely in your browser — output PDFs contain re-rendered page images, so text becomes non-selectable."

### 6.4 `PdfResultsSection` (`src/components/PdfResultsSection.tsx`)

Similar to `ResultsSection` but:
- No thumbnails, no comparison view (just a `FileText` icon)
- 3 inline stat tiles: **Total saved** / **Avg. reduction %** / **N/M Files** (using the same `useCountUp` hook)
- Each file row: name + size arrow + new size + reduction badge + page count
- Per-file **Preview** opens a `Dialog` with an `<iframe src={URL.createObjectURL(processedFile)}>` showing the PDF
- Per-file **Download** and a single **Download all as ZIP** button (filename: `ls-image-compressor_pdfs.zip`)

### 6.5 `usePdfUpload` hook (`src/hooks/usePdfUpload.ts`)

Mirror of `useImageUpload`, with these differences:
- `MAX_PDF_FILES = 5`, `MAX_PDF_SIZE = 100 * 1024 * 1024`
- `UploadedPdf` has a `progress: number` (0..1) for per-file progress, and a `pageCount: number | null` resolved async
- `getPdfPageCount(file)` lazy-loads `pdfjs-dist` and configures `GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'`
- Re-exports `formatBytes` and `getReductionRatio` from `pdfProcessor` for consumers

### 6.6 `utils/pdfProcessor.ts` — the PDF engine

**Exports:**
- Types: `PdfQualityPreset` (`'low' | 'medium' | 'high' | 'custom'`), `PdfProcessSettings`, `PdfProcessResult`
- Constants: `PDF_QUALITY_PRESETS` (low: q=0.4 scale=1.25 maxW=1100; medium: q=0.6 scale=1.75 maxW=1700; high: q=0.82 scale=2.25 maxW=2400)
- Functions: `compressPdf`, `formatBytes`, `getReductionRatio`, `getQualityPresetSettings`, `toDownloadPdfFile`

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
3. Create a new `PDFDocument` via `pdf-lib`, set its `title` / `producer` / `creator` to "LS Image Compressor"
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
9. Return `{ blob, pageCount, sizeBytes, reduction, quality, scale, durationMs }`

**`toDownloadPdfFile(originalName, blob)`** — names the output `<basename>_compressed.pdf`.

**Important caveat (documented in `CompressPdf.tsx` FAQ):** After compression, **text is no longer selectable** — the pages are now full-page JPEG images. This is a known limitation of the "rasterize & re-save" approach. A more sophisticated pipeline could keep text layers intact, but that's not the current implementation.

---

## 7. The Bulk Renamer (`/bulk-rename`)

### 7.1 Page: `src/pages/BulkRename.tsx`

Layout mirrors the PDF page (its own hero, inline HowItWorks/Features/FAQ sections, PageDropOverlay). State is owned by `useFileRename()`.

```
<Header />
<main>
  <section> // hero
    <motion.h1>Bulk File <gradient>Rename</gradient> in Seconds</motion.h1>
    <motion.p>Rename hundreds of files at once with a live preview. ...</motion.p>
    <trust badges: 🔒 👁️ 🆓 📦 ZIP Download />
    <div ref={uploadRef}><FileRenameUploadZone onFilesSelected={addFiles} fileCount={files.length} /></div>
    {files.length > 0 && <FileRenameRuleBuilder rules={rules} onAdd={addRule} onUpdate={updateRule} onRemove={removeRule} onMove={moveRule} onReset={resetRules} />}
    <FileRenamePreviewList ... />
  </section>

  {files.length > 0 && <StatsRow plan={plan} totalSize={totalSize} formatBytes={formatBytes} />}

  <HowItWorksRename />  // inline
  <FeaturesRename />    // inline
  <FaqRename />         // inline
  <Footer />
</main>
<PageDropOverlay visible={isDragging} />
```

The inline `StatsRow` is a 3-tile summary: **Files / Will rename / Total size**.

### 7.2 `FileRenameUploadZone` (`src/components/FileRenameUploadZone.tsx`)

Identical to the image upload zone but `accept` is unset (any file type), `maxFiles = 100`, max size 200 MB, uses a `FilePlus2` icon, no "Ctrl V" hint.

### 7.3 `FileRenameRuleBuilder` (`src/components/FileRenameRuleBuilder.tsx`)

The biggest single component (~850 lines). Lets the user:
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

Below:
- "Clear rules" + "Download renamed ZIP" gradient button
- Animated progress bar while building the ZIP

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
6. `saveAs(blob, 'ls-image-compressor_renamed.zip')` — triggers download
7. `setZipProgress(100)` + `toast.success('✅ Renamed N of M files. ZIP downloaded.')`
8. In `finally`, after 400ms, clear `isZipping` and reset `zipProgress` (gives the user a moment to see "100%")

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

## 8. Shared Page-Behavior Hooks

### 8.1 `useClipboardPaste({ onPaste, enabled = true })` — `src/hooks/useClipboardPaste.ts`

Document-level `paste` listener:
- If `enabled` is false, no-op
- Reads `e.clipboardData.items`, filters to `kind === 'file' && type.startsWith('image/')`
- Skips pastes whose target is an `<input>`, `<textarea>`, or any `contentEditable` element (so users can still paste text into form fields)
- If any files are found → `e.preventDefault()` and `onPaste(files)`

### 8.2 `usePageDropZone({ onDrop, enabled = true })` — `src/hooks/usePageDropZone.ts`

Document-level drag-and-drop tracker:
- Uses a `depth` counter (dragenter increments, dragleave decrements) so the `isDragging` state only goes false when the cursor truly leaves the document
- `hasFiles(e)` checks `e.dataTransfer.types` contains `'Files'` (so the overlay only appears for actual file drags, not text/link drags)
- On `dragover`: `e.preventDefault()` and set `dropEffect = 'copy'`
- On `drop`: `e.preventDefault()`, reset `depth`, reset `isDragging`, and call `onDrop(Array.from(e.dataTransfer.files))`

### 8.3 `useIsMobile()` — `src/hooks/use-mobile.tsx`

Detects viewport `< 768px` via `window.matchMedia('(max-width: 767px)')` + a manual check. Returns `boolean`.

### 8.4 `useToast` + `use-toast.ts` — Radix toast state machine

The classic shadcn-style toast reducer. `TOAST_LIMIT = 1` (only one toast at a time), `TOAST_REMOVE_DELAY = 1_000_000` (effectively never auto-removed). Exposes `toast({...})` and `useToast()`. The actual rendering lives in `components/ui/toaster.tsx`. **In practice, the app uses `sonner` (`toast.success` etc.) for all user notifications — `useToast` is wired but only used by the legacy `<Toaster />` mount in `App.tsx`**.

---

## 9. Shared UI Components

### 9.1 `Header` (`src/components/Header.tsx`)

- Fixed at the top, `z-50`, with `backdrop-blur-xl` background
- Gradient line (`h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent`) at the top edge
- Logo: ⚡ emoji in a tinted rounded square + "LS Image Compressor" gradient text
- Desktop nav (`hidden md:flex`): How It Works / Features / Social Presets / FAQ (smooth-scroll anchors) + Compress PDF / Bulk Rename (`<Link to=...>`) + dark/light toggle
- Mobile nav: dark/light toggle + hamburger. Tapping the hamburger opens a full-screen slide-in panel (right side, `max-w-xs`) with all the same links plus About / Privacy / Terms / Contact
- **Mobile menu accessibility:** body scroll is locked while open, Escape key closes it, first link is focused 50ms after open
- Scroll detection: a `scrolled` state adds a shadow + bottom border when `window.scrollY > 20`

### 9.2 `Footer` (`src/components/Footer.tsx`)

- 4-column grid on desktop (logo+blurb, Product, Company, Legal), single-column on mobile
- 6 social icons (Instagram, LinkedIn, GitHub, CodePen, Mail, Website)
- `handleAnchorClick` only smooth-scrolls when on `/` (else falls through to default `<a href="#...">` behavior)
- Copyright: `© 2026 LS Image Compressor. All rights reserved.`

### 9.3 `NavLink` (`src/components/NavLink.tsx`)

A thin `forwardRef` wrapper around `react-router-dom`'s `NavLink` that takes `className`/`activeClassName`/`pendingClassName` and combines them with the `cn()` helper. **Currently not used by any of the main pages** — the header uses raw `<Link>` and `<a>` instead.

### 9.4 The `ui/` folder (shadcn/ui primitives)

49 components. **Actively used in the app:**
- `button`, `input`, `label`, `slider`, `switch`, `tabs`, `tooltip`, `dialog`, `sonner`, `toast`, `toaster`, `badge`, `accordion`, `popover` (imported but not used in the pages I read — verify), `select` (imported but not used), `card` (imported but not used)

**Installed but unused** (can probably be deleted to slim the install): `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `breadcrumb`, `calendar`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input-otp`, `menubar`, `navigation-menu`, `pagination`, `progress`, `radio-group`, `resizable`, `scroll-area`, `separator`, `sheet`, `sidebar`, `skeleton`, `table`, `textarea`, `toggle`, `toggle-group`, `use-toast` (the local one in `src/hooks/` is used; the one in `ui/` is unused)

> The `use-toast.ts` in `src/hooks/` is the actual one used; the copy in `src/components/ui/use-toast.ts` is identical boilerplate from the shadcn starter and could be removed.

---

## 10. State Management — The Big Picture

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
- **`QueryClient`** is mounted but no `useQuery`/`useMutation` calls exist in the codebase — it's a vestigial shell from the starter template.

---

## 11. Theme System (CSS Variables)

Defined in `src/index.css`:

```css
:root {
  --background: 210 20% 98%;          /* near-white */
  --foreground: 215 15% 15%;          /* near-black */
  --card: 0 0% 100%;
  --card-foreground: 215 15% 15%;
  --popover: 0 0% 100%;
  --popover-foreground: 215 15% 15%;
  --primary: 229 80% 45%;             /* indigo */
  --primary-foreground: 0 0% 100%;
  --secondary: 215 10% 93%;
  --secondary-foreground: 215 15% 25%;
  --muted: 215 10% 95%;
  --muted-foreground: 215 5% 45%;
  --accent: 170 75% 35%;              /* teal */
  --accent-foreground: 0 0% 100%;
  --destructive: 0 70% 50%;
  --destructive-foreground: 0 0% 100%;
  --border: 215 10% 88%;
  --input: 215 10% 88%;
  --ring: 229 80% 45%;
  --radius: 0.5rem;
  --indigo: 229 80% 45%;
  --teal: 170 75% 35%;
  --success: 158 65% 40%;
  --slate: 215 10% 50%;
  --sidebar-*: ...                     /* sidebar vars */
}

.dark {
  /* same names, dark equivalents */
  --background: 215 25% 8%;
  --foreground: 210 10% 95%;
  --primary: 229 75% 55%;
  --accent: 170 70% 40%;
  /* ... */
}
```

**Usage convention:** Components use `hsl(var(--primary))`, `hsl(var(--accent))`, `hsl(var(--destructive))`, etc. — and many inline `style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}` for the signature purple→teal gradient buttons.

**Custom Tailwind utilities** in `src/index.css`:
- `.glass-card` — blurred translucent card
- `.gradient-text` / `.gradient-bg` / `.gradient-border` — the brand gradient
- `.animate-float`, `.animate-scale-in`, `.animate-fade-in-up`, `.animate-pulse-glow`, `.shimmer-gradient` — custom animations
- `.glass-morphism` — frosted glass effect (light + dark variants)

**Custom Tailwind keyframes** in `tailwind.config.ts`:
- `accordion-down` / `accordion-up` — Radix accordion height transitions
- `pulse-glow` — box-shadow pulse with the violet color
- `fade-in-up` — opacity + translateY(24px → 0)

**`inter` font:** loaded from Google Fonts in `index.html` (preconnect + stylesheet link). `body { font-family: 'Inter', sans-serif; }` in `index.css`.

---

## 12. SEO, Metadata, Structured Data (`index.html`)

Heavy SEO setup since this is a content-driven marketing site:

- **Inline pre-mount theme script** — sets `dark` class on `<html>` *before* React mounts, based on `localStorage` to avoid FOUC
- **Title & meta description** — keyword-rich ("Free Online Image Compressor, Resizer & WebP Converter | Compress Images Up to 90%")
- **Author / owner / copyright** — all point to "Lade Stack"
- **Robots meta** — `index, follow, max-image-preview:large, max-snippet:50, ...` and similar lines for `googlebot`, `bingbot`, `slurp`, `duckduckbot`, `yandex`, `baiduspider`, `exabot`, `sosospider`, `facebookexternalhit`, `twitterbot`
- **Geotagging** — `IN / India`
- **Mobile / PWA** — `theme-color: #7C3AED`, `apple-mobile-web-app-capable`, viewport-fit, etc.
- **Canonical** — `https://img.ladestack.in/`
- **Favicons** — inline data-URI SVG with the ⚡ emoji (no actual favicon file, just inline `<link rel="icon" href="data:image/svg+xml,...">`)
- **Open Graph + Twitter** — full set with the `lovable.dev/opengraph-image-p98pqg.png` placeholder image
- **JSON-LD structured data** — 4 blocks:
  1. `WebApplication` — with `aggregateRating` (4.8, 150 ratings), `featureList`, `offers` (free), `browserRequirements`
  2. `FAQPage` — 6 Q&A pairs (privacy, formats, size limit, WebP benefits, no-account, mobile)
  3. `Organization` — Lade Stack + Twitter sameAs
  4. `BreadcrumbList` — single item pointing at `/`

---

## 13. PWA / Offline / Service Worker

**None.** No `manifest.json`, no service worker, no `vite-plugin-pwa`. The site is a plain SPA. Could be a worthwhile addition.

---

## 14. Testing

Vitest is configured (jsdom + `@testing-library/jest-dom` + setup file at `src/test/setup.ts`). 4 test files:
- `example.test.ts` — trivial sanity test
- `imageProcessor.test.ts` — 30+ tests covering `formatFileSize`, `getCompressionRatio`, `estimateQualityForSize`, `computeAspectDimensions`, `calcDimensions` (including the center-crop math and the social-media preset matrix), AVIF format support, `isFormatSupported` (with cache + jsdom stubbing)
- `pdfProcessor.test.ts` — `formatBytes`, `getReductionRatio`, `getQualityPresetSettings`, `PDF_QUALITY_PRESETS` invariants
- `fileRenamer.test.ts` — `splitExtension`, every rename rule kind, rule ordering, `buildRenamePlan` (incl. dedup, extension preservation, `replaceExt`), `sanitizeFileName`

**Hooks are NOT tested.** `useImageUpload`, `usePdfUpload`, `useFileRename`, `useSettings` have no test coverage.
**Components are NOT tested.** Only pure utility functions are tested.
**Pages are NOT tested.**

The `vitest.config.ts` uses `globals: true`, so `describe` / `it` / `expect` are globally available. Run with `npm test` or `bun test`.

---

## 15. Known Tech Debt & Quirks (to be aware of before changing things)

1. **`utils/batchValidation.ts` exists but is never imported.** It was meant for the image upload flow, but `useImageUpload.addFiles` does its validation inline. If you're refactoring batch validation, you could wire this in.
2. **`src/hooks/use-toast.ts` and `src/components/ui/use-toast.ts` are duplicates.** The latter is the shadcn boilerplate; the former is the actually-imported one.
3. **`@tanstack/react-query` is mounted but unused** — `queryClient` is created in `App.tsx` and wrapped in `QueryClientProvider`, but no `useQuery` / `useMutation` is used anywhere.
4. **`browser-image-compression` Web Worker path** is enabled in the fast path, but the `useWebWorker: true` option requires the worker to be available. If the bundler ever fails to include it, the engine would silently fall back to the main thread.
5. **`processImage` always strips EXIF** when going through the canvas path (since canvas re-encoding loses it). When using the `browser-image-compression` fast path, it also strips by default. The `stripEXIF` setting only forces the canvas path — there's no `preserveMetadata: true` implementation. The settings in the panel (preserveMetadata, progressive, embedColorProfile) are accepted but **not actually wired into the processor**.
6. **`getExifOrientation` is a stub** returning `1`. EXIF orientation is ignored. iPhone photos taken in portrait may come out rotated incorrectly. A real fix would parse the EXIF block and pass an orientation to the canvas transform.
7. **`progressive` toggle in the image settings is a no-op.** `canvas.toBlob` doesn't support progressive JPEG.
8. **Social preset lists are inconsistent** between `SettingsPanel` (9 presets) and `SocialPresetsGrid` (6 presets). Users may notice the discrepancy.
9. **PDF compression loses text layer** — every page becomes a full-page JPEG image, so text isn't selectable / searchable. The FAQ honestly documents this.
10. **PDF page count is read on every drop** — `getPdfPageCount` lazy-loads pdfjs every time `addFiles` is called. The lazy-load is cached at module level, but for a single batch the second call still does an unnecessary `getDocument` cycle. Not a perf issue in practice, just verbose.
11. **No error boundary.** If any worker / library throws an unhandled error, the whole React tree unmounts.
12. **No CSP** — the `index.html` loads Google Fonts directly and there's no `Content-Security-Policy` meta tag.
13. **The `<title>` in `index.html` is for the home page only** — sub-pages (`/compress-pdf`, `/bulk-rename`, etc.) don't set their own `<title>` and rely on whatever the browser shows. This is a SEO miss; consider `react-helmet-async` or `react-helmet` for per-route titles.
14. **No analytics or error reporting** — the `Privacy` page explicitly says no tracking, but there's also no Sentry/PostHog/etc. for crash visibility.
15. **Mobile menu accessibility** is decent but the `Suspense` fallback for the route bundle is a blank div, which can show briefly when navigating to a new page.

---

## 16. Suggested Improvements (great AI-assist targets)

These are concrete, well-scoped improvements that the current architecture already supports:

### 16.1 Image tool
- **Honor EXIF orientation.** Implement `getExifOrientation` properly (read the EXIF block from the file, find tag `0x0112`, value 1..8). Pass the result into `canvasProcess` and add a rotation step at the start.
- **Wire `preserveMetadata`, `progressive`, `embedColorProfile`.** Or, more honestly, **remove them from the UI** since they're stubs. Hiding non-functional controls is better than showing a switch that does nothing.
- **Add a true "target KB" iterative loop visualization** — currently the loop runs but there's no per-attempt feedback. Could show "Trying 80%… Trying 70%… 245 KB ✓".
- **Add HEIC input support** (the Settings panel already mentions Safari 16+ for AVIF — HEIC is also a useful input format). Use `heic2any` for decoding.
- **Add WebP animation** — currently animated GIFs are mentioned in a toast that says they become static. You could re-encode to animated WebP using `canvas.toBlob('image/webp')` on a sequence of frames.

### 16.2 PDF tool
- **Smarter page detection.** Currently every page is re-rendered at the same `scale`/`quality`. Image-heavy pages (scans) tolerate much lower quality than text-heavy pages. You could detect "this page is mostly text" and skip re-encoding, or use higher quality for text pages. A naive version: classify by running an edge detector on the rasterized bitmap.
- **Preserve text layer where possible.** Use `pdf-lib` to *modify* the original PDF instead of re-encoding — strip duplicate embedded images, recompress image streams with lower quality. This is the "qpdf -linearize" approach.
- **Allow per-page range selection** ("compress pages 5–10 only").

### 16.3 Renamer
- **Per-rule live preview on hover** (currently the whole list re-renders).
- **Save/load rule presets** to `localStorage` so power users don't rebuild the same pipeline.
- **Regex tester / cheatsheet** inline (the `find` field for a regex rule is just a text input — a tester would be valuable).
- **Drag-to-reorder rules** (currently only up/down buttons).

### 16.4 Cross-cutting
- **Per-route `<title>`** via `react-helmet-async` (or build a small custom `<DocumentTitle>` component).
- **Error boundary** at the route level — wrap each `<Route element={...}>` in an error boundary that shows a friendly "Something went wrong" UI.
- **Service worker + manifest** for PWA install.
- **i18n** — the entire UI is in English, but the search rankings clearly target a global audience. Consider `react-i18next`.
- **Internationalize the format helpers** — `formatFileSize` could use `Intl.NumberFormat` for locale-aware number formatting.
- **Tighten the unused shadcn deps.** Remove the 30+ unused `ui/*` files and their corresponding `@radix-ui/*` deps to slim the bundle by hundreds of KB.
- **Wire `batchValidation.ts`** into `useImageUpload.addFiles` and remove the inline validation, so the test suite can cover the validation path.
- **Add `aria-live` regions** for the processing state and progress percentage (currently only the progress bar has one).

---

## 17. How to Add a New Tool (e.g. Video Compressor)

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
5. **Create `src/components/VideoUploadZone.tsx` + `VideoQueue.tsx` + `VideoSettingsPanel.tsx` + `VideoResultsSection.tsx`** — copy from the PDF versions and rename.
6. **Add the new route to the header nav** in `src/components/Header.tsx` (the `navLinks` array at the top — both the desktop and mobile sections).
7. **Add the new tool to the `ProTeaser` feature list** (`proFeatures` in `ProTeaser.tsx`).
8. **Add structured data** for the new tool in `index.html` (extend the `WebApplication.featureList` array).
9. **Add tests** in `src/test/videoProcessor.test.ts` for the pure engine.

---

## 18. Quick File-by-File Reference

(Every meaningful file in one line — keep this handy when you forget where something lives.)

| File | What it does |
|---|---|
| `index.html` | SEO + JSON-LD + theme bootstrap script |
| `src/main.tsx` | Mount React |
| `src/App.tsx` | Provider stack + routes (lazy) |
| `src/index.css` | Tailwind + theme CSS vars + custom utilities |
| `src/components/Header.tsx` | Fixed top nav, mobile drawer, theme toggle |
| `src/components/Footer.tsx` | 4-column footer + socials + legal links |
| `src/components/HeroSection.tsx` | Home page hero (gradient mesh + floating blobs) |
| `src/components/UploadZone.tsx` | Image drop zone (drag/drop + click) |
| `src/components/ImageQueue.tsx` | Image file grid with per-file status + retry |
| `src/components/SettingsPanel.tsx` | Tabbed Compress/Resize/Format/More settings UI |
| `src/components/ResultsSection.tsx` | After-compress results + side-by-side preview + ZIP |
| `src/components/SocialPresetsGrid.tsx` | 6 social-media presets with live crop preview |
| `src/components/HowItWorks.tsx` | 3-step "How It Works" section |
| `src/components/FeaturesGrid.tsx` | 6 feature tiles |
| `src/components/FAQSection.tsx` | 8 Q&A accordion |
| `src/components/ProTeaser.tsx` | "Pro Coming Soon" + waitlist dialog (localStorage) |
| `src/components/PageDropOverlay.tsx` | Full-page drop overlay (shown by `usePageDropZone`) |
| `src/components/LazySection.tsx` | IntersectionObserver-gated mount with minHeight |
| `src/components/NavLink.tsx` | Wrapper around react-router NavLink (unused) |
| `src/components/PdfUploadZone.tsx` | PDF drop zone |
| `src/components/PdfQueue.tsx` | PDF file grid (with per-file page progress) |
| `src/components/PdfSettingsPanel.tsx` | PDF preset + quality slider |
| `src/components/PdfResultsSection.tsx` | PDF results + iframe preview + ZIP |
| `src/components/FileRenameUploadZone.tsx` | Any-file drop zone for renamer |
| `src/components/FileRenameRuleBuilder.tsx` | Add/remove/reorder 13 rule kinds |
| `src/components/FileRenamePreviewList.tsx` | Live rename preview with diff highlight |
| `src/components/ui/*` | 49 shadcn/ui primitives (most unused) |
| `src/contexts/ThemeContext.tsx` | Dark/light toggle + localStorage |
| `src/hooks/useImageUpload.ts` | Image batch state machine (the main one) |
| `src/hooks/usePdfUpload.ts` | PDF batch state machine |
| `src/hooks/useFileRename.ts` | Renamer batch state machine + ZIP builder |
| `src/hooks/useSettings.ts` | Persistent compression settings |
| `src/hooks/useClipboardPaste.ts` | Document-level paste listener |
| `src/hooks/usePageDropZone.ts` | Document-level drag/drop state |
| `src/hooks/use-toast.ts` | Radix toast reducer (used by `<Toaster/>`) |
| `src/hooks/use-mobile.tsx` | `< 768px` detection |
| `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |
| `src/pages/Index.tsx` | Home page (image tool) |
| `src/pages/CompressPdf.tsx` | PDF tool page |
| `src/pages/BulkRename.tsx` | Renamer page |
| `src/pages/About.tsx` | Marketing about page |
| `src/pages/Contact.tsx` | Contact cards + socials |
| `src/pages/PrivacyPolicy.tsx` | Privacy policy (March 8, 2026) |
| `src/pages/TermsOfService.tsx` | Terms of service (March 8, 2026) |
| `src/pages/NotFound.tsx` | 404 with motion + return-home button |
| `src/utils/imageProcessor.ts` | Image engine: calcDimensions, processImage, toMime, isFormatSupported |
| `src/utils/pdfProcessor.ts` | PDF engine: compressPdf (pdfjs render → pdf-lib rebuild) |
| `src/utils/fileRenamer.ts` | Pure rename engine: renameBase, buildRenamePlan, sanitizeFileName |
| `src/utils/batchValidation.ts` | Pure batch validation (declared, currently unused) |
| `src/test/setup.ts` | jest-dom + matchMedia polyfill |
| `src/test/imageProcessor.test.ts` | ~30 unit tests for image helpers |
| `src/test/pdfProcessor.test.ts` | Unit tests for PDF helpers |
| `src/test/fileRenamer.test.ts` | Unit tests for rename engine |
| `src/test/example.test.ts` | Trivial sanity test |

---

## 19. Conventions & Style Guide

- **No comments in code** (per project owner preference). All comments are JSDoc on the few exported functions.
- **Functional components only.** No class components.
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

---

## 20. End-of-Document Cheat Sheet for AI

When making any change, the AI should always ask itself:

1. **Is the change in the image tool, PDF tool, renamer, or shared infra?** The hooks/utilities split makes it easy to find the right file.
2. **Is it a pure-function change?** If yes, add a unit test in `src/test/<engine>.test.ts` — the test infrastructure is set up.
3. **Does it touch the canvas path?** Mind the rotation+mirror pivot logic in `canvasProcess`. Mind the JPEG white-fill. Mind the quality iteration loop.
4. **Does it touch the PDF path?** Mind that pdfjs mutates the input buffer (always `slice(0)`). Mind that the output is image-only.
5. **Does it touch the renamer?** Mind that extension rules run in a separate pass. Mind the dedup-on-collision.
6. **Does it touch a hook that manages ObjectURLs?** Make sure the new URL is added to `urlsRef` and revoked on cleanup.
7. **Does it add a new dependency?** Run `npm install` and update `package.json`. Consider whether the dep is actually needed (the starter has a lot of unused ones).
8. **Does it add a new page or route?** Follow the pattern in §17. Don't forget the `navLinks` array in `Header.tsx`.
9. **Does it add a new top-level component?** Place it in `src/components/`. If it's a small inline helper (like the inline `HowItWorksPdf` in `CompressPdf.tsx`), it's fine to keep it in the page file.
10. **Does it add new user-facing settings?** Add a `localStorage` key (or extend the existing `ls-image-compressor-settings` schema with a default), update the `Settings` type in `useSettings.ts`, add a UI control in `SettingsPanel.tsx`, and — most importantly — **wire the setting into the processor in `imageProcessor.ts`**. If you can't wire it, don't add the UI.

---

**That's the whole app.** 100% client-side, no server, no auth, no tracking. Three privacy-first tools wrapped in a polished, animated marketing site. Have fun improving it.
