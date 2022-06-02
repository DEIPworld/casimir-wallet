import '@/assets/styles/base.scss';
import '@/assets/styles/tooltip.scss';

import { ApiService } from '@/services/ApiService';

import { createApp } from 'vue';
import { App } from './App';

import { vuetify } from './plugins/vuetify';
import { pinia } from './plugins/pinia';

import { router } from './router';

const apiService = ApiService.getInstance();

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(vuetify);

apiService.init()
  .then(async () => {
    app.mount('#app');
  });
