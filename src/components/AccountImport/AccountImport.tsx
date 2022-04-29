import { defineComponent } from 'vue';

import {
  VWindow,
  VWindowItem
} from 'vuetify/components';
import { AccountImportStart } from '@/components/AccountImport/AccountImportStart';
import { useMultistep } from '@/composable/multistep';
import { AccountImportSeedEnter } from '@/components/AccountImport/AccountImportSeedEnter';
import { AccountImportSuccess } from '@/components/AccountImport/AccountImportSuccess';
import { AccountImportError } from '@/components/AccountImport/AccountImportError';
import { useAccountStore } from '@/stores/account';
import { useRouter } from 'vue-router';

type Steps = 'start' | 'seedEnter' | 'success' | 'error';

export const AccountImport = defineComponent({

  setup() {
    const router = useRouter();

    const { currentsStep, setStep } = useMultistep<Steps>('start');

    const accountStore = useAccountStore();
    const { getOrCreateAccount } = accountStore;

    const goToSeedEnter = () => {
      setStep('seedEnter');
    };

    const makeImport = (seedPhrase: string) => {
      try {
        getOrCreateAccount(seedPhrase);
        setStep('success');
      } catch (e) {
        setStep('error');
      }
    };

    const goToWallet = () => {
      router.push({
        name: 'wallet'
      });
    };

    return () => (
      <>
        <VWindow
          v-model={currentsStep.value}
          class="pa-12 ma-n12"
        >
          <VWindowItem value="start">
            <AccountImportStart
              onClick:next={goToSeedEnter}
            />
          </VWindowItem>
          <VWindowItem value="seedEnter">
            <AccountImportSeedEnter
              onClick:next={makeImport}
            />
          </VWindowItem>

          <VWindowItem value="success">
            <AccountImportSuccess
              onClick:next={goToWallet}
            />
          </VWindowItem>
          <VWindowItem value="error">
            <AccountImportError
              onClick:next={goToWallet}
            />
          </VWindowItem>
        </VWindow>
      </>
    );
  }
});
