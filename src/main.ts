import '@/assets/styles/base.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import ApiService from '@/services/ApiService';
import KeyringService from '@/services/KeyringService';

import { App } from './App';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

ApiService.init()
  .then(() => {
    KeyringService.load();

    app.mount('#app');
  });
