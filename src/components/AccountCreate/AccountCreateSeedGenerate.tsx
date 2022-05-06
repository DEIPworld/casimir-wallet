import { computed, defineComponent, watchEffect } from 'vue';
import { VBtn, VSpacer, VCol, VRow, VSheet } from 'vuetify/components';
import useClipboard from 'vue-clipboard3';
import { useAccountStore } from '@/stores/account';
import { storeToRefs } from 'pinia';
import { useNotify } from '@/composable/notify';

export const AccountCreateSeedGenerate = defineComponent({
  name: 'WalletCreateSeedGenerate',

  emits: [
    'click:next'
  ],

  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { emit }) {
    const { toClipboard } = useClipboard();
    const { showSuccess } = useNotify();


    const accountStore = useAccountStore();
    const { generateSeedPhrase } = accountStore;
    const { tempSeed } = storeToRefs(accountStore);

    const seedGenerate = (): void => {
      tempSeed.value = generateSeedPhrase();
    };

    watchEffect( () => {
      if (props.isActive) seedGenerate();
    });

    const seedArray = computed<string[]>(
      () => tempSeed.value?.split(' ').filter((v) => !!v)
    );

    const seedCopy = async (): Promise<void> => {
      try {
        await toClipboard(tempSeed.value);
        showSuccess('Successfully copied');
      } catch (e) {
        console.error(e);
      }
    };

    const seedItems = () => seedArray.value.map((w, i) => (
      <VCol cols={4}>
        <VSheet
          color="neutral-darken-4"
          class="px-4 py-3"
          rounded
        >
          {i + 1}. {w}
        </VSheet>
      </VCol>
    ));

    return () => (
      <>
        <div class="text-h3 mb-6">
          Set up your secure seed phrase
        </div>

        <div class="text-body1 mb-6">
          Write down the following words in order and keep
          them in a safe place. Anyone who has access
          to it will also have access to your account!
          Then you will be asked to confirm your passphrase.
        </div>

        <VRow>
          {seedItems()}
        </VRow>

        <div class="d-flex mt-12">
          <VBtn
            color="secondary-btn"
            prependIcon="mdi-cached"
            onClick={seedGenerate}
          >
            Generate new
          </VBtn>
          <VBtn
            color="secondary-btn"
            prependIcon="mdi-content-copy"
            class="ml-4"
            onClick={seedCopy}
          >
            Copy
          </VBtn>
          <VSpacer/>
          <VBtn
            color="primary"
            onClick={() => emit('click:next')}
          >
            Next
          </VBtn>
        </div>
      </>
    );
  }
});
