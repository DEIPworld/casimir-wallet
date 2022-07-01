import { defineComponent, computed } from 'vue';
import { RouterLink } from 'vue-router';

import logoUrl from '@/assets/deip-logo.svg';

import {
  VAppBar,
  VAppBarTitle,
  VSpacer,
  VTabs,
  VTab,
  VBtn,
  VMenu,
  VList,
  VListItem,
  VIcon
} from 'vuetify/components';
import { useAccountStore } from '@/stores/account';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

export const Header = defineComponent({
  nane: 'App',

  emits: ['click:logout'],
  setup(props, { emit }) {
    const accountStore = useAccountStore();
    const route = useRoute();

    const { isLoggedIn, multisigAccounts } = storeToRefs(accountStore);

    const isMultiSigView = computed(() => route.path.includes('multisig'));
    const routePrefix = computed(() => (isMultiSigView.value ? 'multisig.' : ''));

    const hideNavigation = computed(() => {
      const routeName = (route.name as string) || '';
      const hideOnRoutes = ['account.import', 'account.create', 'account.oauth'].includes(routeName);
      const hideOnWallet = routeName.includes('wallet') && !isLoggedIn.value;

      return hideOnRoutes || hideOnWallet;
    });

    const renderAdditionalRoutes = () => {
      const items = [];
      if (isMultiSigView.value) {
        items.push(
          <VTab style="height: auto" to={{ name: 'multisig.details' }} exact-path>
            Multisig details
          </VTab>
        );
      }

      return items;
    };

    const renderNavigation = () => (
      <VTabs optional>
        <VTab to={{ name: `${routePrefix.value}wallet` }} exact-path>
          Wallet
        </VTab>
        <VTab to={{ name: `${routePrefix.value}vesting` }} exact-path>
          Vesting
        </VTab>

        {renderAdditionalRoutes()}
      </VTabs>
    );

    const renderMultisigAccounts = () =>
      multisigAccounts.value?.map((item) => (
        <VListItem key={item.address} to={{ name: 'multisig.balances', params: { address: item.address } }}>
          {item.name}
        </VListItem>
      ));

    const renderMenu = () => (
      <VBtn width="180" color="secondary-btn" variant="contained" size="small" rounded={false}>
        Accounts
        <VMenu activator="parent" location="bottom">
          <VList>
            <VListItem to={{ name: 'wallet' }}>my wallet</VListItem>
            <VListItem to={{ name: 'multisig.create' }}>
              <VIcon size="small" class="ml-n2">
                mdi-plus
              </VIcon>
              <span>add multisig</span>
            </VListItem>
            {renderMultisigAccounts()}
            <VListItem onClick={() => emit('click:logout')}>log out</VListItem>
          </VList>
        </VMenu>
      </VBtn>
    );

    return () => (
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
    );
  }
});
