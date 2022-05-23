import { defineComponent, watchEffect } from 'vue';
import {
  VDialog,
  VCard,
  VCardTitle,
  VTextField,
  VBtn,
  VProgressCircular
} from 'vuetify/components';

import { useField, useForm } from 'vee-validate';
import { string, object } from 'yup';

import { useYup } from '@/composable/validate';

export const ConfirmActionModal = defineComponent({
  emits: ['click:confirm', 'click:cancel'],
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirm action'
    },
    error: {
      type: String
    }
  },
  setup(props, { emit }) {
    const { makeError } = useYup();

    const schema = object({
      password: string().required().label('Password')
    });

    const { meta: formState } = useForm({
      validationSchema: schema
    });

    const { value: password } = useField<string>('password');

    watchEffect(() => {
      if (props.isOpen) {
        password.value = '';
      }
    });

    return () => (
      <VDialog modelValue={props.isOpen}>
        <VCard width={700} color='black' class='pa-8'>
          <VCardTitle class='text-h5 text-white justify-center'>
            {props.title}
          </VCardTitle>

          <div class='d-flex mt-12 align-start'>
            <VTextField
              singleLine
              density='comfortable'
              class='spacer mr-8'
              label='Password'
              v-model={password.value}
              {...makeError(props.error)}
            />
            <VBtn
              class='ml-4'
              color='secondary-btn'
              onClick={() => emit('click:cancel')}
            >
              cancel
            </VBtn>
            <VBtn
              class='ml-4'
              disabled={props.isLoading || !formState.value.valid}
              onClick={() => emit('click:confirm', password.value)}
            >
              {props.isLoading ? (
                <VProgressCircular indeterminate={true} />
              ) : (
                'Confirm'
              )}
            </VBtn>
          </div>
        </VCard>
      </VDialog>
    );
  }
});
