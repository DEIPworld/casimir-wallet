import { defineComponent, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import {
  VWindow,
  VWindowItem
} from 'vuetify/components';

import { useAccountStore } from '@/stores/account';
import { useMultistep } from '@/composable/multistep';

import { AccountOAuthAllow } from './AccountOAuthAllow';
import { AccountOAuthUnsigned } from './AccountOAuthUnsigned';
import { MnemonicValidate } from '@/components/MnemonicValidate';

export const AccountOAuth = defineComponent({

  setup() {
    const accountStore = useAccountStore();
    const { isLoggedIn } = storeToRefs(accountStore);

    const { currentsStep, setStep } = useMultistep(
      !isLoggedIn.value ? 'unsigned' : 'start'
    );

    const router = useRouter();

    const goToCreateAccount = () => router.push({
      name: 'account.create',
      query: router.currentRoute.value.query
    });
    const goToImportAccount = () => router.push({
      name: 'account.import',
      query: router.currentRoute.value.query
    });
    const goToStart = () => setStep('start');
    const goToAllow = () => setStep('allow');
    const onAllow = () => accountStore.connectPortal();

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

          <VWindowItem value="start">
            <MnemonicValidate
              title="Allow an access to your DEIP wallet"
              onClick:next={goToAllow}
            />
          </VWindowItem>

          <VWindowItem value="allow">
            <AccountOAuthAllow
              onClick:cancel={goToStart}
              onClick:allow={onAllow}
            />
          </VWindowItem>

        </VWindow>
      </>
    );
  }

});
