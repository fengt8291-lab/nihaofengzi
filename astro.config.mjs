import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://nihaofengzi.top',
  output: 'static',
  integrations: [react(), sitemap({ filter: (page) => new URL(page).pathname !== '/404/' })],
  vite: {
    plugins: [tailwindcss()],
  },
});
