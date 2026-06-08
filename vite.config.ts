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
          if (id.includes("pako") || id.includes("/fflate")) return "vendor-compress";

          // EVERYTHING that touches the React runtime ships in one chunk.
          //
          // Splitting React away from its ecosystem (Radix, router, query,
          // motion, etc) made those chunks import `vendor-react` while
          // `vendor-react` imported them back — a circular dependency. At
          // runtime the browser evaluated a consumer chunk before React had
          // finished initializing, so React's named exports were still
          // `undefined`, producing:
          //   "Cannot read properties of undefined (reading 'useLayoutEffect')"
          // and a blank screen. Keeping the whole React graph in a single
          // chunk removes the cycle: anything that needs React is evaluated
          // in the same module as React itself.
          if (
            id.includes("react-dom") ||
            id.includes("/react/") ||
            id.includes("react/jsx-runtime") ||
            id.includes("scheduler") ||
            id.includes("react-router") ||
            id.includes("@remix-run/router") ||
            id.includes("framer-motion") ||
            id.includes("motion-dom") ||
            id.includes("motion-utils") ||
            id.includes("/motion/") ||
            id.includes("@radix-ui") ||
            id.includes("@floating-ui") ||
            id.includes("react-remove-scroll") ||
            id.includes("use-sync-external-store") ||
            id.includes("aria-hidden") ||
            id.includes("get-nonce") ||
            id.includes("lucide-react") ||
            id.includes("@tanstack") ||
            id.includes("sonner") ||
            id.includes("next-themes") ||
            id.includes("clsx") ||
            id.includes("tailwind-merge") ||
            id.includes("class-variance-authority")
          ) {
            return "vendor-react";
          }

          // Analytics are tiny and loaded strictly after first paint.
          if (id.includes("@vercel")) return "vendor-vercel";

          return "vendor";
        },
      },
    },
  },
}));
