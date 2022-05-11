import { computed, defineComponent, ref } from 'vue';
import { VBtn, VTextarea, VSpacer } from 'vuetify/components';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@/stores/account';
import { number, object, string } from 'yup';
import { useYup } from '@/composable/validate';
import { useField, useForm } from 'vee-validate';

export const AccountImportSeedEnter = defineComponent({
  emits: [
    'click:next'
  ],

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
        <div class="text-h3 mb-6">
          Recover using seed phrase
        </div>

        <div class="text-body1 mb-6">
          <p>
            Enter the backup passphrase associated with the account.
          </p>
        </div>

        <VTextarea
          label="Passphrase (12 words)"
          v-model={mnemonic.value}
          {...makeError(mnemonicError.value)}
          rows={2}
        />

        <div class="d-flex mt-12">
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
