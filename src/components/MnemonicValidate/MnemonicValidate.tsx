import { defineComponent } from 'vue';
import { VBtn, VTextarea, VSpacer } from 'vuetify/components';
import { useField, useForm } from 'vee-validate';
import { useYup } from '@/composable/validate';
import { object, string } from 'yup';
import { storeToRefs } from "pinia";
import { useAccountStore } from '@/stores/account';

export const MnemonicValidate = defineComponent({
  emits: [
    'click:next'
  ],

  props: {
    title: {
      type: String
    },
    description: {
      type: String,
      default: 'Enter the backup passphrase associated with the account.'
    }
  },

  setup(props, { emit }) {
    const { tempSeed } = storeToRefs(useAccountStore());

    const { makeError, mnemonicValidator } = useYup();

    const schema = object({
      mnemonic: string()
        .test(mnemonicValidator)
        .required().label('Mnemonic phrase')
    });

    const { meta: formState } = useForm({
      validationSchema: schema
    });

    const {
      value: mnemonic,
      errorMessage: mnemonicError
    } = useField<string>('mnemonic');

    const process = () => {
      tempSeed.value = mnemonic.value;
      emit('click:next');
    };

    return () => (
      <>
        {props.title && (
          <div class="text-h3 mb-6">
            {props.title}
          </div>
        )}

        <div class="text-body-large mb-12 text-break">
          {props.description}
        </div>

        <VTextarea
          label="Passphrase (12 words)"
          v-model={mnemonic.value}
          {...makeError(mnemonicError.value)}
          rows={2}
        />

        <div class="d-flex mt-6">
          <VSpacer/>

          <VBtn
            class="ml-4"
            disabled={!formState.value.valid}
            onClick={process}
          >
            Next
          </VBtn>
        </div>
      </>
    );
  }

});
