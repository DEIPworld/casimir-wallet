import { defineComponent, ref, computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import useClipboard from 'vue-clipboard3';

import { VBtn, VSheet, VSpacer, VIcon } from 'vuetify/components';
import { DisplayAddress } from '@/components/DisplayAddress';
import { ConfirmActionModal } from '@/components/ConfirmActionModal';

import { useAccountStore } from '@/stores/account';
import { useVestingStore } from '@/stores/vesting';
import { useMultisigWalletStore } from '@/stores/multisigWallet';
import { useNotify } from '@/composable/notify';

import type { ISignatory, IMultisigVestingItem } from '../../../types';

export const MultisigApprovalDetailsVesting = defineComponent({
  props: {
    approvalId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();
    const { toClipboard } = useClipboard();
    const { showSuccess } = useNotify();

    const accountStore = useAccountStore();
    const vestingStore = useVestingStore();
    const multisigStore = useMultisigWalletStore();

    const { address, accountJson, multisigAccountDetails } = storeToRefs(accountStore);
    const { pendingApprovals } = storeToRefs(vestingStore);

    const pendingApproval = computed(() =>
      pendingApprovals.value.find((item: IMultisigVestingItem) => item._id === props.approvalId)
    );
    const depositor = computed(() =>
      pendingApproval.value?.signatories.find(
        (item: ISignatory) => item.address === pendingApproval.value?.initiator
      )
    );
    const isApprovedByUser = computed(() =>
      pendingApproval.value?.signatories.some((item: ISignatory) => item.address === address.value)
    );
    const isAbleToCancel = computed(() => address.value === depositor.value?.address);

    const isConfirmActionModalOpen = ref<boolean>(false);
    const isCancelAction = ref<boolean>(false);
    const isLoading = ref<boolean>(false);
    const platformFee = ref<string>('0');
    const passwordError = ref<string>();

    const getPlatformFee = async (): Promise<string> => {
      if (!address.value || !multisigAccountDetails.value || !pendingApproval.value) {
        return '0';
      }

      try {
        const isFinalApproval =
            pendingApproval.value.approvals === pendingApproval.value.threshold - 1;

        return multisigStore.getMultisigTransactionFee({
          isFirstApproval: false,
          isFinalApproval,
          callHash: pendingApproval.value.callHash,
          callData: pendingApproval.value.callData,
          threshold: multisigAccountDetails.value?.threshold,
          otherSignatories: multisigAccountDetails.value?.signatories
            .filter((item) => item.address !== address.value)
            .map((item) => item.address),
          multisigAddress: multisigAccountDetails.value.address,
          personalAddress: address.value
        });
      } catch (error: any) {
        console.error(error);

        return '0';
      }
    };

    watchEffect(async () => {
      isLoading.value = true;

      platformFee.value = await getPlatformFee();

      isLoading.value = false;
    });

    const onCopy = async (data: string | undefined): Promise<void> => {
      if (!data) return;

      try {
        await toClipboard(data);
        showSuccess('Successfully copied');
      } catch (e) {
        console.error(e);
      }
    };

    const cancelTransaction = async (password: string): Promise<void> => {
      if (!accountJson.value || !multisigAccountDetails.value || !pendingApproval.value) {
        return;
      }

      await vestingStore.cancelVestingClaim(pendingApproval.value._id, {
        sender: {
          account: accountJson.value,
          password
        },
        callHash: pendingApproval.value.callHash,
        multisigAddress: multisigAccountDetails.value?.address,
        otherSignatories: multisigAccountDetails.value?.signatories
          .filter((item) => item.address !== address.value)
          .map((item) => item.address),
        threshold: multisigAccountDetails.value?.threshold
      });
    };

    const approveTransaction = async (password: string): Promise<void> => {
      if (!accountJson.value || !multisigAccountDetails.value || !pendingApproval.value) {
        return;
      }

      await vestingStore.approveVestingClaim({
        sender: { account: accountJson.value, password },
        multisigAddress: multisigAccountDetails.value.address,
        threshold: multisigAccountDetails.value.threshold,
        otherSignatories: multisigAccountDetails.value?.signatories
          .filter((item) => item.address !== address.value)
          .map((item) => item.address)
      });

      multisigStore.getAccountBalance(multisigAccountDetails.value.address);
    };

    const onConfirm = async (password: string): Promise<void> => {
      isLoading.value = true;

      setTimeout(async () => {
        try {
          if (isCancelAction.value) {
            await cancelTransaction(password);
          } else {
            await approveTransaction(password);
          }

          isConfirmActionModalOpen.value = false;

          showSuccess(`Successfully ${isCancelAction.value ? 'revoked' : 'approved'}`);

          router.push({ name: 'multisig.wallet' });
        } catch (error: any) {
          passwordError.value = error.message;
        } finally {
          isLoading.value = false;
        }
      }, 500);
    };

    const onRevoke = (): void => {
      isConfirmActionModalOpen.value = true;
      isCancelAction.value = true;
    };

    const onCloseConfirmActionModal = (): void => {
      isConfirmActionModalOpen.value = false;
      isCancelAction.value = false;
    };

    const renderSignatories = () =>
      pendingApproval.value?.signatories.map((signatory: ISignatory) => (
        <div class="d-flex align-center justify-end">
          <span class="mr-4 text-subtitle-1">{signatory.name}</span>
          <DisplayAddress address={signatory.address} hideCopyButton />
        </div>
      ));

    const renderActionButton = () => {
      if (isAbleToCancel.value) {
        return (
          <VBtn class="ml-4" onClick={onRevoke}>
            Revoke
          </VBtn>
        );
      }

      return (
        <VBtn
          class="ml-4"
          disabled={isApprovedByUser.value}
          onClick={() => (isConfirmActionModalOpen.value = true)}
        >
          {isApprovedByUser.value ? 'Approved' : 'Approve'}
        </VBtn>
      );
    };

    const renderView = () => (
      <div>
        <p class="ml-4 text-h6">Pending vesting claim</p>

        <VSheet rounded color="rgba(255,255,255,.05)" class="mt-4 pa-4 d-flex align-center mb-2">
          <div class="d-flex align-center">
            <span class="text-h6">Depositor</span>
            <div
              class="dw-tooltip dw-tooltip__right ml-2"
              data-tooltip="The creator for this multisig call"
            >
              <VIcon size="x-small">mdi-help-circle-outline</VIcon>
            </div>
          </div>
          <VSpacer />
          <div class="d-flex align-center justify-end w-50 text-break">
            <span class="mr-4 text-subtitle-1">{depositor.value?.name}</span>
            <DisplayAddress address={depositor.value?.address} hideCopyButton />
          </div>
        </VSheet>
        <VSheet rounded color="rgba(255,255,255,.05)" class="pa-4 d-flex align-center mb-2">
          <div class="d-flex align-center">
            <span class="text-h6">Existing approvals</span>
            <div
              class="dw-tooltip dw-tooltip__right ml-2"
              data-tooltip="The current approvals applied to this multisig"
            >
              <VIcon size="x-small">mdi-help-circle-outline</VIcon>
            </div>
          </div>
          <VSpacer />
          <span class="pr-0 text-right text-subtitle-1">
            {pendingApproval.value?.approvals}/{pendingApproval.value?.threshold}
          </span>
        </VSheet>
        <VSheet rounded color="rgba(255,255,255,.05)" class="pa-4 d-flex align-center mb-2">
          <div class="d-flex align-center">
            <span class="text-h6">Signatories</span>
            <div class="dw-tooltip dw-tooltip__right ml-2" data-tooltip="Who approved">
              <VIcon size="x-small">mdi-help-circle-outline</VIcon>
            </div>
          </div>
          <VSpacer />
          <div class="w-50 text-break">{renderSignatories()}</div>
        </VSheet>
        <VSheet
          rounded
          color="rgba(255,255,255,.05)"
          class="pa-4 d-flex align-center mb-2"
        >
          <span class="text-h6">Platform fee (from personal account)</span>
          <VSpacer />
          <span class="text-subtitle-1">{platformFee.value}</span>
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
            <span class="text-truncate">{pendingApproval.value?.callHash}</span>
            <VIcon class="ml-4" size="16px" onClick={() => onCopy(pendingApproval.value?.callHash)}>
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
            <span class="text-truncate">{pendingApproval.value?.callData}</span>
            <VIcon class="ml-4" size="16px" onClick={() => onCopy(pendingApproval.value?.callData)}>
              mdi-content-copy
            </VIcon>
          </div>
        </VSheet>

        <div class="d-flex justify-end align-center mt-8">
          <VBtn color="secondary-btn" onClick={() => router.push({ name: 'multisig.approvals' })}>
            cancel
          </VBtn>
          {renderActionButton()}
        </div>
      </div>
    );

    return () => (
      <>
        {renderView()}
        <ConfirmActionModal
          title="Confirm transaction"
          isOpen={isConfirmActionModalOpen.value}
          isLoading={isLoading.value}
          error={passwordError.value}
          onClick:cancel={onCloseConfirmActionModal}
          onClick:confirm={onConfirm}
        />
      </>
    );
  }
});
