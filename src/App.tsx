import { defineComponent, watchEffect } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import {
  VApp,
  VMain
} from 'vuetify/components';
import { AppNotify } from '@/components/AppNotify/AppNotify';
import { Header } from '@/components/Header';

import { useAccountStore } from '@/stores/account';
import { useWalletStore } from '@/stores/wallet';

export const App = defineComponent({
  nane: 'App',

  setup() {
    const accountStore = useAccountStore();
    const walletStore = useWalletStore();
    const router = useRouter();

    const { address } = storeToRefs(accountStore);

    watchEffect(() => {
      if (address.value) {
        accountStore.getMultisigAccounts();
        walletStore.subscribeToUpdates(address.value);
      }
    });

    const logOut = () => {
      accountStore.logOut();
      walletStore.clear();
      router.push({ name: 'wallet' });
    };

    return () => (
      <VApp>
        <Header onClick:logout={logOut} />
        <VMain>
          <RouterView />
        </VMain>

        <AppNotify />
      </VApp>
    );
  }
});
