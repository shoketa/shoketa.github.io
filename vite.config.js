import { defineConfig } from 'vite';
import { resolve } from 'path';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { lossless: false, quality: 80 },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        project: resolve(__dirname, 'project.html'),
      },
    },
  },
});
