import { createRouter, createWebHistory } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@/stores/account';

// import { HomeView } from '@/components/HomeView';
// import { WalletView } from '@/components/WalletView';

import { MainView } from '@/components/MainView';

import { AccountView } from '@/components/AccountView';
import { AccountCreate } from '@/components/AccountCreate';
import { AccountImport } from '@/components/AccountImport';
import { AccountOAuth } from '@/components/AccountOAuth';

import { WalletBalances } from '@/components/WalletBalances';
import { WalletTransactions } from '@/components/WalletTransactions';

import { VestingView } from '@/components/VestingView';
import { VestingDetails } from '@/components/VestingDetails';

import { ActionView } from '@/components/ActionView';
import { ActionReceive } from '@/components/ActionReceive';
import { ActionSend } from '@/components/ActionSend';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainView,

      children: [
        {
          path: '',
          name: 'wallet',
          component: WalletBalances
        },
        {
          path: 'transactions',
          name: 'wallet.transactions',
          component: WalletTransactions
        }
      ]
    },

    {
      path: '/action',
      component: ActionView,
      redirect: { name: 'action.send' },
      children: [
        {
          path: 'send',
          name: 'action.send',
          component: ActionSend
        },
        {
          path: 'receive',
          name: 'action.receive',
          component: ActionReceive
        }
      ]
    },

    {
      path: '/vesting',
      component: VestingView,
      children: [
        {
          path: '',
          name: 'vesting',
          component: VestingDetails
        }
      ]
    },

    {
      path: '/account',
      component: AccountView,
      redirect: 'create',
      children: [
        {
          path: 'create',
          name: 'account.create',
          component: AccountCreate
        },

        {
          path: 'import',
          name: 'account.import',
          component: AccountImport
        },

        {
          path: 'oauth',
          name: 'account.oauth',
          component: AccountOAuth
        }
      ]
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const accountStore = useAccountStore();
  const { isLoggedIn } = storeToRefs(accountStore);

  const guestAllowed = ['wallet', 'account.create', 'account.import'];

  if ( !isLoggedIn) {
    if (guestAllowed.includes(to.name as string)) next();
    next({ name: 'wallet' });
  } else {
    next();
  }
});

export { router };
