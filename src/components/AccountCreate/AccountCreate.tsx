import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

import { VWindow, VWindowItem } from 'vuetify/components';

import { AccountCreatePassword } from '@/components/AccountCreate/AccountCreatePassword';

import { AccountCreateStart } from './AccountCreateStart';
import { AccountCreateSeedGenerate } from './AccountCreateSeedGenerate';
import { AccountCreateSeedCheck } from './AccountCreateSeedCheck';
import { AccountCreateFinish } from './AccountCreateFinish';
import { AccountCreateMulti } from './AccountCreateMulti';


type Steps = 'start' | 'seedGenerate' | 'seedCheck' | 'setPassword' | 'finish';

export const AccountCreate = defineComponent({
  props: {
    accountType: {
      type: String,
      default: 'single',
      validator(value: string) {
        return ['single', 'multi'].includes(value);
      }
    }
  },
  setup(props) {
    const router = useRouter();

    const currentsStep = ref<Steps>('start');

    const setStep = (step: Steps): void => {
      currentsStep.value = step;
    };

    const goToSeedGenerate = (): void => setStep('seedGenerate');
    const goToSeedCheck = (): void => setStep('seedCheck');
    const goToPasswordSet = (): void => setStep('setPassword');
    const goToFinish = (): void => setStep('finish');

    const goToWallet = (): void => {
      router.push({
        name: 'wallet'
      });
    };

    const goToRestore = (): void => {
      router.push({
        name: 'account.import'
      });
    };

    const renderSingleCreateView = () => (
      <VWindow v-model={currentsStep.value} class="pa-12 ma-n12">
        <VWindowItem value="start">
          <AccountCreateStart onClick:restore={goToRestore} onClick:start={goToSeedGenerate} />
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
          <AccountCreatePassword onClick:restart={goToSeedGenerate} onAccountCreated={goToFinish} />
        </VWindowItem>

        <VWindowItem value="finish">
          <AccountCreateFinish onClick:next={goToWallet} />
        </VWindowItem>
      </VWindow>
    );

    const renderMultiCreateView = () => (
      <AccountCreateMulti />
    );

    return () => props.accountType === 'single' ? renderSingleCreateView() : renderMultiCreateView();
  }
});
