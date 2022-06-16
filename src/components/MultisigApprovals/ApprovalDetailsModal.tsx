import { defineComponent, computed } from 'vue';

import {
  VBtn,
  VDialog,
  VCard,
  VCardTitle,
  VCardSubtitle,
  VTextField,
  VIcon
} from 'vuetify/components';
import { DisplayAddress } from '@/components/DisplayAddress';

import { useField, useForm } from 'vee-validate';
import { string, object } from 'yup';

import { useYup } from '@/composable/validate';

export const ApprovalDetailsModal = defineComponent({
  emits: ['click:cancel', 'click:confirm'],
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    pendingApproval: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const { makeError } = useYup();

    const schema = object({
      callData: string().required().label('Call Data')
    });

    const { meta: formState } = useForm({
      validationSchema: schema
    });

    const { value: callData, errorMessage } = useField<string>('callData');

    const isFinalApproval = computed(() => true);

    const renderSignatories = () => (
      <div>
        <div class="d-flex align-center justify-end">
          <span class="text-body-1 mr-4">DAVE</span>
          <DisplayAddress address="[address]" hideCopyButton />
        </div>
        <div class="d-flex align-center justify-end">
          <span class="text-body-1 mr-4">YAN</span>
          <DisplayAddress address="[address]" hideCopyButton />
        </div>
      </div>
    );

    return () => (
      <VDialog modelValue={props.isOpen}>
        <VCard width="700" class="pa-8">
          <VCardTitle class="text-h6 text-white">Pending call hash</VCardTitle>
          <div class="d-flex ml-4 text-white text-subtitle-1">
            <span>[pending call hash]</span>
            <div
              class="dw-tooltip dw-tooltip__right ml-2 text-body-1"
              data-tooltip="The call hash as calculated for this transaction"
            >
              <VIcon size="x-small">mdi-help-circle-outline</VIcon>
            </div>
          </div>

          <div class="ms-4">
            <div class="d-flex justify-space-between align-center mt-4">
              <div class="text-body-1">Depositor</div>
              <div class="d-flex align-center">
                <span class="text-body-1 mr-4">DAVE</span>
                <DisplayAddress address="[address]" hideCopyButton />
              </div>
            </div>
            <div class="d-flex justify-space-between align-center mt-4">
              <span class="text-body-1">Existing approvals</span>
              <span class="pr-0 text-body-1 text-right">1/3</span>
            </div>
            <div class="d-flex justify-space-between align-start mt-4">
              <span class="text-body-1 pt-0">Signatories</span>
              {renderSignatories()}
            </div>

            {isFinalApproval.value && (
              <>
                <div class="d-flex text-body-1 mt-8">
                  <span>Call data for final approval</span>
                  <div
                    class="dw-tooltip dw-tooltip__right ml-2 text-body-1"
                    data-tooltip=
                      "The full call data that can be supplied\n to a final call to multi approvals"
                  >
                    <VIcon size="x-small">mdi-help-circle-outline</VIcon>
                  </div>
                </div>
                <VTextField
                  singleLine
                  density="comfortable"
                  class="mt-2"
                  v-model={callData.value}
                  {...makeError(errorMessage.value)}
                />
              </>
            )}

            <div class="d-flex justify-end align-center mt-8">
              <VBtn color="secondary-btn" onClick={() => emit('click:cancel')}>
                cancel
              </VBtn>
              <VBtn class="ml-4" disabled={isFinalApproval.value && !formState.value.valid}>
                Approve
              </VBtn>
            </div>
          </div>
        </VCard>
      </VDialog>
    );
  }
});
