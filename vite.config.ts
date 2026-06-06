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
          // main bundle and only download when their route is visited.
          if (id.includes("pdfjs-dist") || id.includes("pdf-lib")) return "vendor-pdf";
          if (id.includes("jszip") || id.includes("file-saver")) return "vendor-zip";
          if (id.includes("browser-image-compression")) return "vendor-image";

          // React core — shared by every page; preload in parallel with main.
          if (
            id.includes("react-dom") ||
            id.includes("/react/") ||
            id.includes("scheduler")
          ) {
            return "vendor-react";
          }

          // React Router + its underlying @remix-run/router engine. Split
          // out so the 100+ KB of router internals can be cached as a single
          // fingerprinted asset and never bundled with the React runtime.
          if (id.includes("react-router") || id.includes("@remix-run/router")) {
            return "vendor-router";
          }

          // Animation engine — only the pages that use framer-motion pull it in.
          if (
            id.includes("framer-motion") ||
            id.includes("motion-dom") ||
            id.includes("motion-utils") ||
            id.includes("/motion/")
          ) {
            return "vendor-motion";
          }

          // All Radix UI primitives + their internals (floating-ui,
          // react-remove-scroll, etc) share a single chunk so any dialog /
          // popover page can be opened without re-downloading.
          if (
            id.includes("@radix-ui") ||
            id.includes("@floating-ui") ||
            id.includes("react-remove-scroll") ||
            id.includes("use-sync-external-store")
          ) {
            return "vendor-radix";
          }

          // Small icon library used by the shadcn primitives — keep separate
          // from Phosphor (which Vite auto-splits per icon).
          if (id.includes("lucide-react")) return "vendor-lucide";

          // State/data/utility deps.
          if (id.includes("@tanstack")) return "vendor-query";
          if (id.includes("sonner")) return "vendor-sonner";
          if (
            id.includes("clsx") ||
            id.includes("tailwind-merge") ||
            id.includes("class-variance-authority")
          ) {
            return "vendor-utils";
          }

          // Theme resolution — only loaded for the theme provider.
          if (id.includes("next-themes")) return "vendor-themes";

          // Analytics are tiny but bundled to a dedicated chunk so they can
          // be loaded strictly after first paint.
          if (id.includes("@vercel")) return "vendor-vercel";

          // Pako / zlib — used by pdfjs for compression.
          if (id.includes("pako") || id.includes("/fflate")) return "vendor-compress";

          return "vendor";
        },
      },
    },
  },
}));
