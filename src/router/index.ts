import { createRouter, createWebHistory } from 'vue-router';

import { HomeView } from '@/components/HomeView';

import { AccountCreate } from '@/components/AccountCreate';
import { AccountImport } from '@/components/AccountImport';
import { WalletView } from '@/components/WalletView';
import { WalletBalances } from '@/components/WalletBalances';
import { WalletTransactions } from '@/components/WalletTransactions';
import { AccountView } from '@/components/AccountView';
import { VestingView } from '@/components/VestingView';
import { VestingDetails } from '@/components/VestingDetails';

const isLoggedIn = () => {
  const storageData = localStorage.getItem('DEIP:account');
  const accountData = storageData ? JSON.parse(storageData) : storageData;
console.log(accountData?.address);
  return !!accountData?.address;
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: isLoggedIn() ? WalletView : HomeView,
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

export { router };
