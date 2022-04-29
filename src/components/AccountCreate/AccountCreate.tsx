import { computed, defineComponent, ref } from 'vue';

import useClipboard from 'vue-clipboard3';

import {
  VWindow,
  VWindowItem,
  VSnackbar
} from 'vuetify/components';

import { AccountCreateStart } from './AccountCreateStart';
import { AccountCreateSeedGenerate } from './AccountCreateSeedGenerate';
import { AccountCreateSeedCheck } from './AccountCreateSeedCheck';
import { AccountCreateFinish } from './AccountCreateFinish';

import { useAccountStore } from '@/stores/account';
import { storeToRefs } from 'pinia';
import { useNotify } from '@/composable/notify';
import { useRouter } from 'vue-router';

type Steps = 'start' | 'seedGenerate' | 'seedCheck' | 'finish';

export const AccountCreate = defineComponent({
  setup() {
    const router = useRouter();
    const { notify, notifyIsActive, showNotify } = useNotify();

    const accountStore = useAccountStore();
    const { address } = storeToRefs(accountStore);
    const { generateSeedPhrase, getOrCreateAccount } = accountStore;

    const currentsStep = ref<Steps>('start');
    const checkWordNumber = ref<number>(0);

    const seedPhrase = ref<string>('');
    const seedArray = computed<string[]>(
      () => seedPhrase.value.split(' ').filter((v) => !!v)
    );

    const setStep = (step: Steps): void => {
      currentsStep.value = step;
    };

    const seedGenerate = (): void => {
      seedPhrase.value = generateSeedPhrase();
    };

    const getRandomWord = (): void => {
      checkWordNumber.value = Math.floor(
        Math.random() * seedArray.value.length - 1
      );
    };

    const { toClipboard } = useClipboard();

    const seedCopy = async (): Promise<void> => {
      try {
        await toClipboard(seedPhrase.value);
        showNotify('Successfully copied');
      } catch (e) {
        console.error(e);
      }
    };

    const goToSeedGenerate = () => {
      seedGenerate();
      setStep('seedGenerate');
    };

    const goToSeedCheck = () => {
      getRandomWord();
      setStep('seedCheck');
    };

    const goToFinish = (checkWord: string) => {
      const isValid: boolean = checkWord === seedArray.value[checkWordNumber.value];

      if (isValid) {
        try {
          getOrCreateAccount(seedPhrase.value);
          setStep('finish');
        } catch (err) {
          let errMessage = 'Unknown Error';
          if (err instanceof Error) errMessage = err.message;

          showNotify(errMessage, 'error');
        }
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
          class="pa-12"
        >
          <VWindowItem value="start">
            <AccountCreateStart
              onClick:restoreWallet={() => false}
              onClick:next={goToSeedGenerate}
            />
          </VWindowItem>

          <VWindowItem value="seedGenerate">
            <AccountCreateSeedGenerate
              seedArray={seedArray.value}
              onClick:seedGenerate={seedGenerate}
              onClick:seedCopy={seedCopy}
              onClick:next={goToSeedCheck}
            />
          </VWindowItem>

          <VWindowItem value="seedCheck">
            <AccountCreateSeedCheck
              wordNumber={checkWordNumber.value}
              onClick:restart={goToSeedGenerate}
              onClick:next={goToFinish}
            />
          </VWindowItem>

          <VWindowItem value="finish">
            <AccountCreateFinish
              address={address.value}
              onClick:next={goToWallet}
            />
          </VWindowItem>
        </VWindow>
        <VSnackbar
          v-model={notifyIsActive.value}
          color={notify.color}
          timeout={1000}
        >
          {notify.message}
        </VSnackbar>
      </>
    );
  }
});
