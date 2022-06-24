import { defineComponent } from 'vue';
import { storeToRefs } from 'pinia';
import useClipboard from 'vue-clipboard3';

import { VBtn, VCardTitle, VIcon } from 'vuetify/components';

import { DisplayAddress } from '@/components/DisplayAddress';
import { useNotify } from '@/composable/notify';
import { useAccountStore } from '@/stores/account';

export const MultisigActionSendFormDetails = defineComponent({
  emits: ['click:cancel', 'click:confirm'],
  props: {
    transactionData: {
      type: Object
    }
  },
  setup(props, { emit }) {
    const { toClipboard } = useClipboard();
    const { showSuccess } = useNotify();

    const accountStore = useAccountStore();

    const { address, multisigAccountDetails } = storeToRefs(accountStore);

    const onCopy = async (data: string): Promise<void> => {
      try {
        await toClipboard(data);
        showSuccess('Successfully copied');
      } catch (e) {
        console.error(e);
      }
    };

    return () => (
      <>
        <VCardTitle class="text-h6 text-white">Authorize transaction</VCardTitle>
        <div class="ms-4 text-subtitle-1">
          <div class="d-flex justify-space-between align-center mt-4">
            <div class="d-flex align-center">
              <span>Sending from</span>
              <div
                class="dw-tooltip dw-tooltip__right ml-4 text-body-1"
                data-tooltip="The sending account that will be used to send this transaction.\nAny applicable fees will be paid by this account"
              >
                <VIcon size="x-small">mdi-help-circle-outline</VIcon>
              </div>
            </div>
            <div class="d-flex align-center">
              <span class="mr-4">{multisigAccountDetails.value?.name}</span>
              <DisplayAddress address={multisigAccountDetails.value?.address} hideCopyButton />
            </div>
          </div>
          <div class="d-flex justify-space-between align-center mt-4">
            <div class="d-flex align-center">
              <span>Multisig signatory</span>
              <div
                class="dw-tooltip dw-tooltip__right ml-4 text-body-1"
                data-tooltip="The signatory is one of the allowed accounts on the multisig,\nmaking a recorded approval for the transaction"
              >
                <VIcon size="x-small">mdi-help-circle-outline</VIcon>
              </div>
            </div>
            <DisplayAddress address={address.value} hideCopyButton />
          </div>

          <div class="mt-8">
            <div class="d-flex align-center">
              <span>Call data for final approval</span>
              <div
                class="dw-tooltip dw-tooltip__right ml-4 text-body-1"
                data-tooltip="The full call data that can be supplied\n to a final call to multi approvals"
              >
                <VIcon size="x-small">mdi-help-circle-outline</VIcon>
              </div>
            </div>
            <div class="d-flex align-center mt-2">
              <span class="text-truncate">{props.transactionData?.callData}</span>
              <VIcon
                class="ml-4"
                size="16px"
                onClick={() => onCopy(props.transactionData?.callData)}
              >
                mdi-content-copy
              </VIcon>
            </div>
          </div>
          <div class="mt-8">
            <div class="d-flex align-center">
              <span>Call hash</span>
              <div
                class="dw-tooltip dw-tooltip__right ml-4 text-body-1"
                data-tooltip="The call hash as calculated for this transaction"
              >
                <VIcon size="x-small">mdi-help-circle-outline</VIcon>
              </div>
            </div>
            <div class="d-flex align-center mt-2">
              <span class="text-truncate">{props.transactionData?.callHash}</span>
              <VIcon
                class="ml-4"
                size="16px"
                onClick={() => onCopy(props.transactionData?.callHash)}
              >
                mdi-content-copy
              </VIcon>
            </div>
          </div>

          <div class="d-flex justify-end align-center mt-8">
            <VBtn color="secondary-btn" onClick={() => emit('click:cancel')}>
              cancel
            </VBtn>
            <VBtn class="ml-4" onClick={() => emit('click:confirm')}>
              Sign and submit
            </VBtn>
          </div>
        </div>
      </>
    );
  }
});
