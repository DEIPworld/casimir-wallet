import { defineComponent, ref, watchEffect } from 'vue';
import { VBtn, VSpacer, VTextField } from 'vuetify/components';
import { useAccountStore } from '@/stores/account';
import { storeToRefs } from 'pinia';

export const AccountCreateSeedCheck = defineComponent({
  name: 'WalletCreateSeedCheck',

  emits: [
    'click:restart',

    'seedChecked'
  ],

  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { emit }) {
    const { tempSeed } = storeToRefs(useAccountStore());

    const word = ref<string>('');
    const checkWord = ref<string>('');
    const checkWordNum = ref<number>(0);

    const getCheckWord = () => {
      const seedArray = tempSeed.value.split(' ');
      const num = Math.floor(Math.random()*seedArray.length);

      checkWord.value = seedArray[num];
      checkWord.value = seedArray[num];
      checkWordNum.value = num + 1;
    };

    const verify = () => {
      const isValid = word.value === checkWord.value;

      if (isValid) {
        emit('seedChecked');
      } else {
        console.error('not valid');
      }
    };

    watchEffect( () => {
      if (props.isActive) getCheckWord();
    });

    return () => (
      <>
        <div class="text-h3 mb-6">
          Check the phrase
        </div>
        <VTextField
          label={`Word #${checkWordNum.value}`}
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
            disabled={!word.value}
            onClick={verify}
          >Check & proceed</VBtn>
        </div>
      </>
    );
  }
});
