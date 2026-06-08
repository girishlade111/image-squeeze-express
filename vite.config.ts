import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Stable filenames per vendor group so we can `<link rel="modulepreload">`
        // them in index.html and let HTTP/2 push the heaviest deps in parallel
        // with the main bundle.
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          // Heavy tool-specific deps are split out so they never reach the
          // main bundle and only download when their route is visited. These
          // are route-lazy and never imported by the React runtime, so they
          // cannot create an evaluation cycle with the core chunk.
          if (id.includes("pdfjs-dist") || id.includes("pdf-lib")) return "vendor-pdf";
          if (id.includes("jszip") || id.includes("file-saver")) return "vendor-zip";
          if (id.includes("browser-image-compression")) return "vendor-image";

          // Analytics are tiny and loaded strictly after first paint. They
          // do not pull in React, so they can never cycle back to the core.
          if (id.includes("@vercel")) return "vendor-vercel";

          // EVERYTHING else ships in one chunk with React.
          //
          // Previously React was split away from its ecosystem (Radix,
          // router, query, motion, and a long tail of react-* helper
          // packages). Those consumer chunks imported `vendor-react`, and
          // `vendor-react` imported them back — a circular dependency. At
          // runtime the browser evaluated a consumer chunk before React had
          // finished initializing, so React's named exports were still
          // `undefined`, producing:
          //   "Cannot read properties of undefined (reading 'useLayoutEffect')"
          // and a blank screen.
          //
          // Rather than enumerate every react-importing package (vaul, cmdk,
          // embla, recharts, react-hook-form, input-otp, … — easy to miss
          // one and reintroduce the cycle), we keep the entire shared React
          // graph in a single chunk. Anything that needs React is evaluated
          // in the same module as React itself, so no cycle is possible.
          return "vendor-react";
        },
      },
    },
  },
}));
