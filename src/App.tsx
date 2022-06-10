import { RouterView, useRouter, RouterLink } from 'vue-router';
import { computed, defineComponent, watchEffect } from 'vue';

import logoUrl from '@/assets/deip-logo.svg';

import {
  VApp,
  VAppBar,
  VAppBarTitle,
  VSpacer,
  VTabs,
  VTab,
  VMain,
  VBtn,
  VMenu,
  VList,
  VListItem,
  VIcon
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
    const router = useRouter();

    const { isLoggedIn, address } = storeToRefs(accountStore);

    const hideNavigation = computed(() => {
      const routeName = (route.name as string) || '';
      const hideOnRoutes = ['account.import', 'account.create'].includes(routeName);
      const hideOnWallet = routeName.includes('wallet') && !isLoggedIn.value;

      return hideOnRoutes || hideOnWallet;
    });

    watchEffect(() => {
      if (address.value) walletStore.subscribeToUpdates(address.value);
    });

    const logOut = () => {
      accountStore.logOut();
      walletStore.clear();
      router.push({ name: 'wallet' });
    };

    const renderNavigation = () => (
      <VTabs optional>
        <VTab to={{ name: 'wallet' }} exact-path>
          Wallet
        </VTab>
        <VTab to={{ name: 'vesting' }} exact-path>
          Vesting
        </VTab>
      </VTabs>
    );

    const renderMenu = () => (
      <VBtn  width="180" color="secondary-btn" variant="contained" size="small" rounded={false}>
        Accounts
        <VMenu activator="parent" location='bottom'>
          <VList>
            <VListItem to={{ name: 'wallet' }}>
                my wallet
            </VListItem>
            <VListItem to={{ name: 'multisig.create' }}>
              <VIcon
                size="small"
                class="ml-n2"
              >
                mdi-plus
              </VIcon>
              <span>Add multisig</span>
            </VListItem>
            <VListItem onClick={logOut}>log out</VListItem>
          </VList>
        </VMenu>
      </VBtn>
    );

    // <VSwitch
    //   hide-details
    //   inset
    //   inline
    //   trueIcon="mdi-white-balance-sunny"
    //   falseIcon="mdi-weather-night"
    // />

    return () => (
      <VApp>
        <VAppBar height="72" flat color="black" border class="px-6">
          <VAppBarTitle style={'flex: none'} class={'mr-18'}>
            <RouterLink to={{ name: 'wallet' }}>
              <img src={logoUrl} alt="DEIP Wallet" height="24" class="d-block" />
            </RouterLink>
          </VAppBarTitle>

          {!hideNavigation.value && renderNavigation()}

          <VSpacer />
          {isLoggedIn.value && renderMenu()}
        </VAppBar>
        <VMain>
          <RouterView />
        </VMain>

        <AppNotify />
      </VApp>
    );
  }
});
