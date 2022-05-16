import { fileURLToPath, URL } from 'url';

import { defineConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vuetify from '@vuetify/vite-plugin';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist'
  },
  envDir: '../',
  publicDir: '../public',
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
      styles: 'expose'
    }),
    vueJsx()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
