import { computed, defineComponent, ref } from 'vue';

import {
  VWindow,
  VWindowItem,
  VSnackbar
} from 'vuetify/components';

import { AccountCreateStart } from './AccountCreateStart';
import { AccountCreateSeedGenerate } from './AccountCreateSeedGenerate';
import { AccountCreateSeedCheck } from './AccountCreateSeedCheck';
import { AccountCreateFinish } from './AccountCreateFinish';

import { useRouter } from 'vue-router';
import { AccountCreatePassword } from '@/components/AccountCreate/AccountCreatePassword';

type Steps = 'start' | 'seedGenerate' | 'seedCheck' | 'setPassword' | 'finish';

export const AccountCreate = defineComponent({
  setup() {
    const router = useRouter();

    const currentsStep = ref<Steps>('start');

    const setStep = (step: Steps): void => {
      currentsStep.value = step;
    };

    const goToSeedGenerate = (): void => setStep('seedGenerate');
    const goToSeedCheck = (): void => setStep('seedCheck');
    const goToPasswordSet = (): void => setStep('setPassword');
    const goToFinish = (): void => setStep('finish');

    const goToWallet = () => router.push({ name: 'wallet' });
    const goToRestore = () => router.push({ name: 'account.import' });

    const goToOAuth = () => router.push({
      name: 'account.oauth',
      query: router.currentRoute.value.query
    });

    return () => (
      <>
        <VWindow
          v-model={currentsStep.value}
          class="pa-12 ma-n12"
        >
          <VWindowItem value="start">
            <AccountCreateStart
              onClick:restore={goToRestore}
              onClick:start={goToSeedGenerate}
            />
          </VWindowItem>

          <VWindowItem value="seedGenerate">
            <AccountCreateSeedGenerate
              isActive={currentsStep.value === 'seedGenerate'}

              onClick:next={goToSeedCheck}
            />
          </VWindowItem>

          <VWindowItem value="seedCheck">
            <AccountCreateSeedCheck
              isActive={currentsStep.value === 'seedCheck'}

              onClick:restart={goToSeedGenerate}

              onSeedChecked={goToPasswordSet}
            />
          </VWindowItem>

          <VWindowItem value="setPassword">
            <AccountCreatePassword
              onClick:restart={goToSeedGenerate}

              onAccountCreated={goToFinish}
            />
          </VWindowItem>

          <VWindowItem value="finish">
            <AccountCreateFinish
              onClick:next={goToWallet}
              onClick:oauth={goToOAuth}
              isHasPortal={!!router.currentRoute.value.query.portal}
            />
          </VWindowItem>
        </VWindow>
      </>
    );
  }
});
