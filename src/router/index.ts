import { createRouter, createWebHistory } from 'vue-router';

// import { HomeView } from '@/components/HomeView';
// import { WalletView } from '@/components/WalletView';

import { AccountCreate } from '@/components/AccountCreate';
import { AccountImport } from '@/components/AccountImport';
import { WalletBalances } from '@/components/WalletBalances';
import { WalletTransactions } from '@/components/WalletTransactions';
import { AccountView } from '@/components/AccountView';
import { VestingView } from '@/components/VestingView';
import { VestingDetails } from '@/components/VestingDetails';
import { DepositView } from '@/components/DepositView';
import { SendView } from '@/components/SendView';
import { MainView } from '@/components/MainView';
import { useAccountStore } from '@/stores/account';
import { storeToRefs } from 'pinia';

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
      path: '/deposit',
      name: 'wallet.deposit',
      component: DepositView
    },

    {
      path: '/send',
      name: 'wallet.send',
      component: SendView
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
