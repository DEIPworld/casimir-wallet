import { RouterView, RouterLink } from 'vue-router';
import { BodyOverlay } from '@/components/BodyOverlay';
import { computed, defineComponent } from 'vue';

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

export const App = defineComponent({
  nane: 'App',

  setup() {

    const accountStore = useAccountStore();
    const route = useRoute();

    const { isLoggedIn } = storeToRefs(accountStore);

    const hideNavigation = computed(() => {
      const routeName = route.name as string;
      const hideOnRoutes = ['account.import', 'account.create'].includes(routeName);
      const hideOnWallet = routeName.includes('wallet') && !isLoggedIn.value;

      return hideOnRoutes || hideOnWallet;
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
            <img src="/assets/deip-logo.svg" alt="DEIP Wallet" height="24" class="d-block"/>
          </VAppBarTitle>

          {!hideNavigation.value && renderNavigation()}

          <VSpacer/>

        </VAppBar>
        <VMain>
          <RouterView />
        </VMain>
        <BodyOverlay />
      </VApp>
    );
  }
});
