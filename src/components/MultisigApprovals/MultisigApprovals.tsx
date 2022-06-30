import { defineComponent, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { ConfirmActionModal } from '@/components/ConfirmActionModal';

import { useAccountStore } from '@/stores/account';
import { useMultisigWalletStore } from '@/stores/multisigWallet';
import { useNotify } from '@/composable/notify';

import { MultisigApprovalsList } from './MultisigApprovalsList';
import { MultisigApprovalDetails } from './MultisigApprovalDetails';

import type { IMultisigTransactionItem } from '../../../types';

export const MultisigApprovals = defineComponent({
  setup() {
    const router = useRouter();
    const { showSuccess } = useNotify();

    const accountStore = useAccountStore();
    const multisigStore = useMultisigWalletStore();

    const { accountJson, address, multisigAccountDetails } = storeToRefs(accountStore);

    const selectedTransaction = ref<IMultisigTransactionItem>();
    const isConfirmActionModalOpen = ref<boolean>(false);
    const isLoading = ref<boolean>(false);
    const passwordError = ref<string>();

    const onOpenDetailsView = (item: IMultisigTransactionItem) => {
      selectedTransaction.value = item;
    };

    const onCloseDetailsView = () => {
      selectedTransaction.value = undefined;
    };

    const onApprove = (password: string) => {
      isLoading.value = true;

      setTimeout(async () => {
        if (
          !accountJson.value ||
          !selectedTransaction.value ||
          !multisigAccountDetails.value ||
          !selectedTransaction.value
        ) {
          return;
        }

        try {
          const isFinalApproval =
            selectedTransaction.value.approvals === selectedTransaction.value.threshold - 1;

          await multisigStore.approveMultisigTransaction(
            selectedTransaction.value._id,
            isFinalApproval,
            {
              sender: {
                account: accountJson.value,
                password
              },
              recipient: selectedTransaction.value.recipient,
              amount: selectedTransaction.value.amount,
              callHash: selectedTransaction.value.callHash,
              callData: selectedTransaction.value.callData,
              multisigAddress: multisigAccountDetails.value.address,
              otherSignatories: multisigAccountDetails.value?.signatories
                .filter((item) => item.address !== address.value)
                .map((item) => item.address),
              threshold: multisigAccountDetails.value?.threshold
            }
          );

          showSuccess('Successfully approved');
          router.push({ name: 'multisig.wallet' });
        } catch (error: any) {
          passwordError.value = error.message;
        } finally {
          isLoading.value = false;
        }
      }, 500);
    };

    const renderView = () => {
      if (selectedTransaction.value) {
        return (
          <MultisigApprovalDetails
            pendingApproval={selectedTransaction.value}
            onClick:cancel={onCloseDetailsView}
            onClick:confirm={() => (isConfirmActionModalOpen.value = true)}
          />
        );
      }

      return <MultisigApprovalsList onClick:select={onOpenDetailsView} />;
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
