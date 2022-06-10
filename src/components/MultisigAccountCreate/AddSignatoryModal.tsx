import { defineComponent, watchEffect } from 'vue';
import {
  VDialog,
  VCard,
  VCardTitle,
  VTextField,
  VBtn
} from 'vuetify/components';
import { useField, useForm } from 'vee-validate';

import { useYup } from '@/composable/validate';

export const AddSignatoryModal = defineComponent({
  emits: ['click:confirm', 'click:cancel'],
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    signatorySchema: {
      type: Object,
      required: true
    },
    signatoryError: {
      type: String
    }
  },
  setup(props, { emit }) {
    const { makeError } = useYup();

    const { meta: formState } = useForm({
      validationSchema: props.signatorySchema
    });

    const { value: address, errorMessage: addressError } = useField<string>('address');
    const { value: name, errorMessage: nameError } = useField<string>('name');

    watchEffect(() => {
      if (props.isOpen) {
        address.value = '';
        name.value = '';
      }
    });

    return () => (
      <VDialog modelValue={props.isOpen}>
        <VCard width={700} color='black' class='pa-8'>
          <VCardTitle class='text-h5 text-white justify-center'>
            Add signatory
          </VCardTitle>

          <VTextField
            singleLine
            density='comfortable'
            class='spacer'
            label='Address'
            v-model={address.value}
            {...makeError(addressError.value || props.signatoryError)}
          />
          <VTextField
            singleLine
            density='comfortable'
            class='spacer'
            label='Name'
            v-model={name.value}
            {...makeError(nameError.value)}
          />
          <div class='d-flex mt-12 justify-end align-start'>
            <VBtn
              class='ml-4'
              color='secondary-btn'
              onClick={() => emit('click:cancel')}
            >
              cancel
            </VBtn>
            <VBtn
              class='ml-4'
              disabled={!formState.value.valid}
              onClick={() => emit('click:confirm', { address: address.value, name: name.value })}
            >
              confirm
            </VBtn>
          </div>
        </VCard>
      </VDialog>
    );
  }
});
