import { defineComponent, ref } from 'vue';
import { VBtn, VSpacer, VTextField } from 'vuetify/components';

export const AccountCreateSeedCheck = defineComponent({
  name: 'WalletCreateSeedCheck',

  emits: [
    'click:restart',
    'click:next'
  ],

  props: {
    wordNumber: {
      type: Number,
      default: 0
    }
  },

  setup(props, { emit }) {
    const word = ref('');

    return () => (
      <>
        <div class="text-h3 mb-6">
          Check the phrase
        </div>
        <VTextField
          label={`Word #${props.wordNumber + 1}`}
          v-model={word.value}
        />

        <div class="d-flex mt-12">
          <VSpacer/>
          <VBtn
            color="secondary-btn"
            onClick={() => emit('click:restart')}
          >
            Start Again
          </VBtn>
          <VBtn
            color="primary"
            class="ml-4"
            onClick={() => emit('click:next', word.value)}
          >Check & finish</VBtn>
        </div>
      </>
    );
  }
});
