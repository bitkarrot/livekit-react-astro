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
    headers: {
      // Required for ngrok
      'Access-Control-Allow-Origin': '*',
    }
  },
  prefetch: false,
  integrations: [react(), tailwind()],
  image: {
    service: { entrypoint: 'astro/assets/services/noop' }, // Disable Sharp
  },
  vite: {
    server: {
      host: true,
      strictPort: true,
      cors: true,
      hmr: {
        clientPort: 443,
      },
    // allowedHosts: [
    //   "*"
    //   //"e46c-99-113-33-226.ngrok-free.app"
    // ]
    },
    resolve: {
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.scss', '.css']
    }
  }
});// @ts-check
