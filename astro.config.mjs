// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  // Prefetch links on hover so page navigation feels instant
  prefetch: true,
  // Hide the Astro dev toolbar in `npm run dev`
  devToolbar: { enabled: false },
  markdown: {
    // Light/dark code themes; global.css switches to the dark one with the site theme
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' }
    }
  }
});