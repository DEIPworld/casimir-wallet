import { defineComponent, watchEffect, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import qs from 'qs';

import {
  VWindow,
  VWindowItem
} from 'vuetify/components';

import { useWalletStore } from '@/stores/wallet';
import { useAccountStore } from '@/stores/account';
import { useMultistep } from '@/composable/multistep';
import { useNotify } from '@/composable/notify';

import { AccountOAuthAllow } from './AccountOAuthAllow';
import { AccountOAuthUnsigned } from './AccountOAuthUnsigned';
import { AccountOAuthPaywall } from './AccountOAuthPaywall';
import { MnemonicValidate } from '@/components/MnemonicValidate';

export const AccountOAuth = defineComponent({

  setup() {
    const router = useRouter();
    const route = useRoute();
    const accountStore = useAccountStore();

    const { showSuccess } = useNotify();
    const { isLoggedIn, accountDao } = storeToRefs(accountStore);

    const balanceStore = useWalletStore();
    const { balance } = storeToRefs(balanceStore);

    const initialStep = ref<string>('start');
    const isLoading = ref<boolean>(false);

    watchEffect(() => {
      switch (true) {
        case !isLoggedIn.value:
          initialStep.value = 'unsigned';
          break;

        case !accountDao.value && Number(balance.value?.data.actual) < 10:
          initialStep.value = 'paywall';
          break;

        default:
          initialStep.value = 'start';
      }
    });

    const { currentsStep, setStep } = useMultistep(initialStep.value);

    const goToCreateAccount = () => router.push({
      name: 'account.create',
      query: router.currentRoute.value.query
    });
    const goToImportAccount = () => router.push({
      name: 'account.import',
      query: router.currentRoute.value.query
    });
    const goToFundsReceive = () => router.push({
      name: 'action.receive'
    });

    const goToStart = () => setStep('start');
    const goToAllow = () => setStep('allow');

    const onAllowConnect = async () => {
      isLoading.value = true;

      try {
        const { signature, publicKey } = await accountStore.connectPortal(route.query);

        showSuccess('Portal is successfully connected.');

        const msgData = {
          signature,
          publicKey,
          daoId: accountDao.value.daoId,
          channel: 'Deip.Wallet'
        };

        if (window.opener) {
          window.opener.postMessage(msgData, '*');

          window.close();
        } else {
          window.open(
            qs.stringify(msgData, { addQueryPrefix: true }),
            '_self'
          );
        }
      } finally {
        isLoading.value = false;
      }
    };

    return () => (
      <>
        <VWindow
          v-model={currentsStep.value}
          class="pa-12 ma-n12"
        >

          <VWindowItem value="unsigned">
            <AccountOAuthUnsigned
              onClick:create={goToCreateAccount}
              onClick:import={goToImportAccount}
            />
          </VWindowItem>

          <VWindowItem value="paywall">
            <AccountOAuthPaywall
              onClick:receive={goToFundsReceive}
            />
          </VWindowItem>

          <VWindowItem value="start">
            <MnemonicValidate
              title="Allow an access to your DEIP wallet"
              onClick:next={goToAllow}
            />
          </VWindowItem>

          <VWindowItem value="allow">
            <AccountOAuthAllow
              onClick:cancel={goToStart}
              onClick:allow={onAllowConnect}
              portal={route.query}
              isLoading={isLoading.value}
            />
          </VWindowItem>

        </VWindow>
      </>
    );
  }

});
