import { RouterView } from 'vue-router';
import { BodyOverlay } from '@/components/BodyOverlay';
import { computed, defineComponent, watchEffect } from 'vue';

import logoUrl from '@/assets/deip-logo.svg';

import {
  VApp,
  VAppBar,
  VAppBarTitle,
  VSpacer,
  VTabs,
  VTab,
  VMain
} from 'vuetify/components';
import { useAccountStore } from '@/stores/account';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useWalletStore } from '@/stores/wallet';
import { AppNotify } from '@/components/AppNotify/AppNotify';

export const App = defineComponent({
  nane: 'App',

  setup() {
    const accountStore = useAccountStore();
    const walletStore = useWalletStore();
    const route = useRoute();

    const { isLoggedIn, address } = storeToRefs(accountStore);

    const hideNavigation = computed(() => {
      const routeName = route.name as string || '';
      const hideOnRoutes = ['account.import', 'account.create'].includes(routeName);
      const hideOnWallet = routeName.includes('wallet') && !isLoggedIn.value;

      return hideOnRoutes || hideOnWallet;
    });

    watchEffect( () => {
      if (address.value) walletStore.subscribeToUpdates(address.value);
    });

    const renderNavigation = () => (
      <VTabs optional>
        <VTab to={{ name: 'wallet' }} exact-path>Wallet</VTab>
        <VTab to={{ name: 'vesting' }} exact-path>Vesting</VTab>
      </VTabs>
    );

    return () => (
      <VApp>
        <VAppBar
          elevation={0}
          color={'rgba(255,255,255, .05)'}
          class={'pl-18 pr-18'}
        >
          <VAppBarTitle style={'flex: none'} class={'mr-18'}>
            <img src={logoUrl} alt="DEIP Wallet" height="24" class="d-block"/>
          </VAppBarTitle>

          {!hideNavigation.value && renderNavigation()}

          <VSpacer/>

        </VAppBar>
        <VMain>
          <RouterView />
        </VMain>
        <BodyOverlay />

        <AppNotify />
      </VApp>
    );
  }
});
