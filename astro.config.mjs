// @ts-check
import { defineConfig } from 'astro/config';

// Static build (output: 'static' is the default). Astro emits plain HTML/CSS/JS
// into dist/, which the existing Fastify server (server.mjs) serves on Forge.
// `site` powers canonical URLs, OG tags, and a future sitemap.
export default defineConfig({
  site: 'https://arunsanna.com',
  build: {
    format: 'file', // emit /index.html (not /index/index.html) — simpler for Fastify static
  },
  devToolbar: { enabled: false },
});
