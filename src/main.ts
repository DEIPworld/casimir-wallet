import '@/assets/styles/base.scss';
import '@/assets/styles/tooltip.scss';

import '@polkadot/wasm-crypto/initOnlyAsm';

import SentryInit from '@/utils/sentry';

import { ApiService } from '@/services/ApiService';
import { DeipService } from '@/services/DeipService';

import { createApp } from 'vue';
import { App } from './App';

import { vuetify } from './plugins/vuetify';
import { pinia } from './plugins/pinia';

import { router } from './router';

const apiService = ApiService.getInstance();
const deipService = DeipService.getInstance();

const app = createApp(App);

SentryInit(app, router);

app.use(pinia);
app.use(router);
app.use(vuetify);

Promise.all([
  apiService.init(),
  deipService.init()
])
  .then(async () => {
    app.mount('#app');
  });
