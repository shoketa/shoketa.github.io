import { defineConfig } from 'vite';
import { resolve } from 'path';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

async function walkImages(dir, exts) {
  const result = [];
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return result; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walkImages(full, exts));
    else if (exts.some(e => entry.name.toLowerCase().endsWith(e))) result.push(full);
  }
  return result;
}

function generateWebpPlugin() {
  return {
    name: 'generate-webp',
    async closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const files = await walkImages(distDir, ['.png', '.jpg', '.jpeg']);
      for (const file of files) {
        const out = file.replace(/\.(png|jpe?g)$/i, '.webp');
        await sharp(file).webp({ quality: 80 }).toFile(out);
      }
      console.log(`[generate-webp] Created ${files.length} .webp files`);
    },
  };
}

export default defineConfig({
  plugins: [
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { lossless: false, quality: 80 },
    }),
    generateWebpPlugin(),
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
