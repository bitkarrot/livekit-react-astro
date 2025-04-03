import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import nodeAdapter from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output:'server',
  adapter: nodeAdapter({
    mode: 'standalone',
    host: true,
  }),
  server: {
    host: true,
    port: 4321,
  },
  prefetch: false,
  integrations: [react(), tailwind()],
  image: {
    service: { entrypoint: 'astro/assets/services/noop' }, // Disable Sharp
  },
  vite: {
    resolve: {
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json']
    }
  }
});// @ts-check
