import { createRouter, createWebHistory } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@/stores/account';

// import { HomeView } from '@/components/HomeView';
// import { WalletView } from '@/components/WalletView';

import { MainView } from '@/components/MainView';

import { AccountView } from '@/components/AccountView';
import { AccountCreate } from '@/components/AccountCreate';
import { AccountImport } from '@/components/AccountImport';

import { MultisigView } from '@/components/MultisigView';
import { MultisigWalletView } from '@/components/MultisigWalletView';
import { MultisigBalances } from '@/components/MultisigBalances';
import { MultisigTransactions } from '@/components/MultisigTransactions';
import { MultisigApprovals } from '@/components/MultisigApprovals';
import { MultisigVestingView } from '@/components/MultisigVestingView';
import { MultisigVestingDetails } from '@/components/MultisigVestingDetails';
import { MultisigDetailsView } from '@/components/MultisigDetailsView';
import { MultisigActionSend } from '@/components/MultisigActionSend';

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
        }
      ]
    },

    {
      path: '/multisig',
      name: 'multisig',
      props: true,
      redirect: { name: 'multisig.create' },
      component: MultisigView,
      children: [
        {
          path: 'create',
          name: 'multisig.create',
          props: {
            accountType: 'multi'
          },
          component: AccountCreate
        },
        {
          path: ':address',
          name: 'multisig.view',
          props: true,
          redirect: { name: 'multisig.balances' },
          component: MultisigView,
          children: [
            {
              path: 'wallet',
              name: 'multisig.wallet',
              props: true,
              redirect: { name: 'multisig.balances' },
              component: MultisigWalletView,
              children: [
                {
                  path: '',
                  name: 'multisig.balances',
                  component: MultisigBalances
                },
                {
                  path: 'transactions',
                  name: 'multisig.transactions',
                  component: MultisigTransactions
                },
                {
                  path: 'approvals',
                  name: 'multisig.approvals',
                  component: MultisigApprovals
                }
              ]
            },
            {
              path: 'action',
              redirect: { name: 'multisig.action.send' },
              component: ActionView,
              children: [
                {
                  path: 'send',
                  name: 'multisig.action.send',
                  props: true,
                  component: MultisigActionSend
                },
                {
                  path: 'receive',
                  name: 'multisig.action.receive',
                  props: true,
                  component: ActionReceive
                }
              ]
            },
            {
              path: 'vesting',
              component: MultisigVestingView,
              children: [
                {
                  path: '',
                  name: 'multisig.vesting',
                  component: MultisigVestingDetails
                }
              ]
            },
            {
              path: 'details',
              name: 'multisig.details',
              component: MultisigDetailsView
            }
          ]
        }
      ]
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const accountStore = useAccountStore();
  const { isLoggedIn } = storeToRefs(accountStore);

  const guestAllowed = ['wallet', 'account.create', 'account.import'];

  if (!isLoggedIn) {
    if (guestAllowed.includes(to.name as string)) next();
    next({ name: 'wallet' });
  } else {
    next();
  }
});

export { router };
