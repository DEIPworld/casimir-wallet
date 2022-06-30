import { defineComponent } from 'vue';

import {
  VWindow,
  VWindowItem
} from 'vuetify/components';
import { AccountImportStart } from '@/components/AccountImport/AccountImportStart';
import { useMultistep } from '@/composable/multistep';
import { AccountImportSuccess } from '@/components/AccountImport/AccountImportSuccess';
import { AccountImportError } from '@/components/AccountImport/AccountImportError';
import { useRouter } from 'vue-router';
import { AccountCreatePassword } from '@/components/AccountCreate/AccountCreatePassword';
import { MnemonicValidate } from '@/components/MnemonicValidate';

type Steps = 'start' | 'seedEnter' | 'setPassword' | 'success' | 'error';

export const AccountImport = defineComponent({

  setup() {
    const router = useRouter();

    const { currentsStep, setStep } = useMultistep<Steps>('start');

    const goToSeedEnter = () => setStep('seedEnter');
    const goToPasswordSet = (): void => setStep('setPassword');
    const goToSuccess = (): void => setStep('success');
    const goToError = (): void => setStep('success');

    const goToOAuth = () => router.push({
      name: 'account.oauth',
      query: router.currentRoute.value.query
    });

    const goToWallet = () => router.push({ name: 'wallet' });

    return () => (
      <>
        <VWindow
          v-model={currentsStep.value}
          class="ma-n12"
        >
          <VWindowItem value="start" class="pa-12">
            <AccountImportStart
              onClick:start={goToSeedEnter}
            />
          </VWindowItem>

          <VWindowItem value="seedEnter" class="pa-12">
            <MnemonicValidate
              title="Import using seed phrase"
              onClick:next={goToPasswordSet}
            />
          </VWindowItem>

          <VWindowItem value="setPassword" class="pa-12">
            <AccountCreatePassword
              onClick:restart={goToSeedEnter}

              onAccountCreated={goToSuccess}
              onAccountFailed={goToError}
            />
          </VWindowItem>

          <VWindowItem value="success" class="pa-12">
            <AccountImportSuccess
              onClick:next={goToWallet}
              onClick:oauth={goToOAuth}
              hasPortal={!!router.currentRoute.value.query.portalId}
            />
          </VWindowItem>
          <VWindowItem value="error" class="pa-12">
            <AccountImportError
              onClick:next={goToSeedEnter}
            />
          </VWindowItem>
        </VWindow>
      </>
    );
  }
});
