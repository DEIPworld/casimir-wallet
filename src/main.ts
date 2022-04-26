import '@/assets/styles/base.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import ApiService from '@/services/ApiService';

import { App } from './App';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

ApiService.loadApi()
  .then(async () => {
    ApiService.loadKeyring();

    app.mount('#app');
  });
