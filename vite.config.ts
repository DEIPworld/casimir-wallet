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
  plugins: [
    vue(),
    vueJsx(),
    vuetify({
      autoImport: true,
      styles: 'expose'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
