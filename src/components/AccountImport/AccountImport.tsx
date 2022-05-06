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
import { AccountCreatePassword } from '@/components/AccountCreate/AccountCreatePassword';

type Steps = 'start' | 'seedEnter' | 'setPassword' | 'success' | 'error';

export const AccountImport = defineComponent({

  setup() {
    const router = useRouter();

    const { currentsStep, setStep } = useMultistep<Steps>('start');

    const goToSeedEnter = () => setStep('seedEnter');
    const goToPasswordSet = (): void => setStep('setPassword');
    const goToSuccess = (): void => setStep('success');
    const goToError = (): void => setStep('success');

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
              onClick:start={goToSeedEnter}
            />
          </VWindowItem>

          <VWindowItem value="seedEnter">
            <AccountImportSeedEnter
              onClick:next={goToPasswordSet}
            />
          </VWindowItem>

          <VWindowItem value="setPassword">
            <AccountCreatePassword
              onClick:restart={goToSeedEnter}

              onAccountCreated={goToSuccess}
              onAccountFailed={goToError}
            />
          </VWindowItem>

          <VWindowItem value="success">
            <AccountImportSuccess
              onClick:next={goToWallet}
            />
          </VWindowItem>
          <VWindowItem value="error">
            <AccountImportError
              onClick:next={goToSeedEnter}
            />
          </VWindowItem>
        </VWindow>
      </>
    );
  }
});
