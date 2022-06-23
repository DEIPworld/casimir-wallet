import { defineComponent, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { ConfirmActionModal } from '@/components/ConfirmActionModal';

import { useAccountStore } from '@/stores/account';
import { useMultisigWalletStore } from '@/stores/multisigWallet';

import { ApprovalsList } from './ApprovalsList';
import { ApprovalDetails } from './ApprovalDetails';

import type { IMultisigTransaction } from '../../../types';

export const MultisigApprovals = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const multisigStore = useMultisigWalletStore();

    const { accountJson, address, multisigAccountDetails } = storeToRefs(accountStore);

    const selectedTransaction = ref<IMultisigTransaction>();
    const isConfirmActionModalOpen = ref<boolean>(false);
    const isLoading = ref<boolean>(false);
    const passwordError = ref<string>();

    const onOpenDetailsView = (item: IMultisigTransaction) => {
      selectedTransaction.value = item;
    };

    const onCloseDetailsView = () => {
      selectedTransaction.value = undefined;
    };

    const onApprove = (password: string) => {
      if (
        !accountJson.value ||
        !selectedTransaction.value ||
        !multisigAccountDetails.value ||
        !selectedTransaction.value
      ) {
        return;
      }

      isLoading.value = true;

      try {
        const isFinalApproval =
          selectedTransaction.value.approvals === selectedTransaction.value.threshold - 1;

        multisigStore.approveMultisigTransaction(selectedTransaction.value._id, isFinalApproval, {
          sender: {
            account: accountJson.value,
            password
          },
          callHash: selectedTransaction.value.callHash,
          callData: selectedTransaction.value.callData,
          multisigAddress: multisigAccountDetails.value.address,
          otherSignatories: multisigAccountDetails.value?.signatories
            .filter((item) => item.address !== address.value)
            .map((item) => item.address),
          threshold: multisigAccountDetails.value?.threshold
        });
      } catch (error: any) {
        passwordError.value = error.message;
      } finally {
        isLoading.value = false;
      }
    };

    const renderView = () => {
      if (selectedTransaction.value) {
        return (
          <ApprovalDetails
            pendingApproval={selectedTransaction.value}
            onClick:cancel={onCloseDetailsView}
            onClick:confirm={() => (isConfirmActionModalOpen.value = true)}
          />
        );
      }

      return <ApprovalsList onClick:select={onOpenDetailsView} />;
    };

    return () => (
      <>
        {renderView()}
        <ConfirmActionModal
          title="Confirm transaction"
          isOpen={isConfirmActionModalOpen.value}
          isLoading={isLoading.value}
          error={passwordError.value}
          onClick:cancel={() => (isConfirmActionModalOpen.value = false)}
          onClick:confirm={onApprove}
        />
      </>
    );
  }
});
