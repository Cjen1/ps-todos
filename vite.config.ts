import path from "path";
import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vite.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('automerge')) {
              return 'automerge-vendor';
            }
            if (id.includes('react')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
  plugins: [react(), tailwindcss(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
});
