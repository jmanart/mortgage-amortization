// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages configuration
  // Update the site URL with your GitHub username
  // For project pages: https://<username>.github.io/<repository-name>
  // For user/organization pages: https://<username>.github.io
  site: 'https://jmanart.github.io',
  // Base path for project pages (remove this line or set to '/' for user/organization pages)
  base: '/mortgage-amortization',
  integrations: [tailwind()],
});
