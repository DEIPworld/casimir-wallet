import * as Sentry from '@sentry/vue';
import { BrowserTracing } from '@sentry/tracing';

import type { App } from 'vue';
import type { Router } from 'vue-router';

const SentryInit = (app: App, router: Router) => Sentry.init({
  app,
  dsn: import.meta.env.DW_SENTRY,
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracingOrigins: [
        'wallet-testnet.deip.world',
        'wallet.deip.world',
        /^\//
      ]
    })
  ],
  tracesSampleRate: import.meta.env.PROD ? 1.0 : 0.2,
  environment: import.meta.env.MODE,
  release: import.meta.env.DW_RELEASE
});

export default SentryInit;
