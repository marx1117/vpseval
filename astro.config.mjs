import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://vpseval.com',
  integrations: [
    sitemap({
      filter: (page) => !page.startsWith('https://vpseval.com/go/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
