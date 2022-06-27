import { defineComponent, computed } from 'vue';
import useClipboard from 'vue-clipboard3';
import { storeToRefs } from 'pinia';

import { VBtn, VSheet, VIcon } from 'vuetify/components';
import { DisplayAddress } from '@/components/DisplayAddress';

import { useAccountStore } from '@/stores/account';
import { useNotify } from '@/composable/notify';

import type { ISignatory } from 'types';

export const MultisigApprovalDetails = defineComponent({
  emits: ['click:cancel', 'click:confirm'],
  props: {
    pendingApproval: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const { toClipboard } = useClipboard();
    const { showSuccess } = useNotify();

    const accountStore = useAccountStore();
    const { address } = storeToRefs(accountStore);

    const depositor = computed(() =>
      props.pendingApproval.signatories.find(
        (item: ISignatory) => item.address === props.pendingApproval.initiator
      )
    );
    const isApprovedByUser = computed(() =>
      props.pendingApproval.signatories.some(
        (item: ISignatory) => item.address === address.value && item.isApproved
      )
    );

    const onCopy = async (data: string): Promise<void> => {
      try {
        await toClipboard(data);
        showSuccess('Successfully copied');
      } catch (e) {
        console.error(e);
      }
    };

    const renderSignatories = () =>
      props.pendingApproval.signatories.map((signatory: ISignatory) => (
        <div class="d-flex align-center justify-end">
          <span class="mr-4 text-subtitle-1">{signatory.name}</span>
          <DisplayAddress address={signatory.address} hideCopyButton />
        </div>
      ));

    return () => (
      <>
        <div>
          <VSheet
            rounded
            color="rgba(255,255,255,.05)"
            class="pa-4 d-flex align-center justify-space-between mb-2"
          >
            <div class="d-flex align-center">
              <span class="text-h6">Depositor</span>
              <div
                class="dw-tooltip dw-tooltip__right ml-2"
                data-tooltip="The creator for this multisig"
              >
                <VIcon size="x-small">mdi-help-circle-outline</VIcon>
              </div>
            </div>
            <div class="d-flex align-center">
              <span class="mr-4 text-subtitle-1">{depositor.value.name}</span>
              <DisplayAddress address={depositor.value.address} hideCopyButton />
            </div>
          </VSheet>
          <VSheet
            rounded
            color="rgba(255,255,255,.05)"
            class="pa-4 d-flex align-center justify-space-between mb-2"
          >
            <div class="d-flex align-center">
              <span class="text-h6">Existing approvals</span>
              <div
                class="dw-tooltip dw-tooltip__right ml-2"
                data-tooltip="The current approvals applied to this multisig"
              >
                <VIcon size="x-small">mdi-help-circle-outline</VIcon>
              </div>
            </div>
            <span class="pr-0 text-right text-subtitle-1">
              {props.pendingApproval.approvals}/{props.pendingApproval.threshold}
            </span>
          </VSheet>
          <VSheet
            rounded
            color="rgba(255,255,255,.05)"
            class="pa-4 d-flex align-center justify-space-between mb-2"
          >
            <div class="d-flex align-center">
              <span class="text-h6">Signatories</span>
              <div class="dw-tooltip dw-tooltip__right ml-2" data-tooltip="Who approved">
                <VIcon size="x-small">mdi-help-circle-outline</VIcon>
              </div>
            </div>
            <div>{renderSignatories()}</div>
          </VSheet>

          <VSheet rounded color="rgba(255,255,255,.05)" class="pa-4 mb-2">
            <div class="d-flex align-center">
              <span class="text-h6">Pending call hash</span>
              <div
                class="dw-tooltip dw-tooltip__right ml-2"
                data-tooltip="The call hash as calculated for this transaction"
              >
                <VIcon size="x-small">mdi-help-circle-outline</VIcon>
              </div>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-truncate">{props.pendingApproval.callHash}</span>
              <VIcon
                class="ml-4"
                size="16px"
                onClick={() => onCopy(props.pendingApproval.callHash)}
              >
                mdi-content-copy
              </VIcon>
            </div>
          </VSheet>

          <VSheet rounded color="rgba(255,255,255,.05)" class="pa-4 mb-2">
          <div class="d-flex align-center">
            <span class="text-h6">Call data for final approval</span>
            <div
              class="dw-tooltip dw-tooltip__right ml-2"
              data-tooltip="The full call data that can be supplied\n to a final call to multi approvals"
            >
              <VIcon size="x-small">mdi-help-circle-outline</VIcon>
            </div>
          </div>
          <div class="d-flex justify-space-between align-center">
            <span class="text-truncate">{props.pendingApproval.callData}</span>
            <VIcon class="ml-4" size="16px" onClick={() => onCopy(props.pendingApproval.callData)}>
              mdi-content-copy
            </VIcon>
          </div>
          </VSheet>

          <div class="d-flex justify-end align-center mt-8">
            <VBtn color="secondary-btn" onClick={() => emit('click:cancel')}>
              cancel
            </VBtn>
            {!isApprovedByUser.value && (
              <VBtn class="ml-4" onClick={() => emit('click:confirm')}>
                Approve
              </VBtn>
            )}
          </div>
        </div>
      </>
    );
  }
});
