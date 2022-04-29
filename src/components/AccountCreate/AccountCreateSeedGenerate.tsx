import { defineComponent, ref } from 'vue';
import { VBtn, VSpacer, VCol, VRow, VSheet } from 'vuetify/components';

export const AccountCreateSeedGenerate = defineComponent({
  name: 'WalletCreateSeedGenerate',

  emits: [
    'click:seedGenerate',
    'click:seedCopy',
    'click:next'
  ],

  props: {
    seedArray: {
      type: Array,
      default: () => []
    }
  },

  setup(props, { emit }) {
    const seedItems = () => props.seedArray?.map((w, i) => (
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
          <p>
            Write down the following words in order and keep
            them in a safe place. Anyone who has access
            to it will also have access to your account!
            Then you will be asked to confirm your passphrase.
          </p>
        </div>

        <VRow>
          {seedItems()}
        </VRow>

        <div class="d-flex mt-12">
          <VBtn
            color="secondary-btn"
            prependIcon="mdi-cached"
            onClick={() => emit('click:seedGenerate')}
          >
            Generate new
          </VBtn>
          <VBtn
            color="secondary-btn"
            prependIcon="mdi-content-copy"
            class="ml-4"
            onClick={() => emit('click:seedCopy')}
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
