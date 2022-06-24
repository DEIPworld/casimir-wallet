import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { ConfirmActionModal } from '@/components/ConfirmActionModal';

import { useAccountStore } from '@/stores/account';
import { useMultisigWalletStore } from '@/stores/multisigWallet';
import { useNotify } from '@/composable/notify';

import { MultisigActionSendForm } from './MultisigActionSendForm';
import { MultisigActionSendFormDetails } from './MultisigActionSendFormDetails';

import type { IMultisigTransactionData } from '../../../types';

export const MultisigActionSend = defineComponent({
  props: {
    address: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();
    const { showSuccess } = useNotify();

    const accountStore = useAccountStore();
    const multisigStore = useMultisigWalletStore();

    const { address, accountJson, multisigAccountDetails } = storeToRefs(accountStore);

    const isDetailsViewOpen = ref<boolean>(false);
    const transactionData = ref<IMultisigTransactionData>();
    const isConfirmActionModalOpen = ref<boolean>(false);
    const isLoading = ref<boolean>(false);
    const passwordError = ref<string>();

    const recipient = ref<string>();
    const amount = ref<number>();

    const onConfirm = (recipientAddress: string, amountToSend: number): void => {
      const data = multisigStore.createMultisigTransaction(recipientAddress, amountToSend);

      transactionData.value = data;
      recipient.value = recipientAddress;
      amount.value = amountToSend;

      isDetailsViewOpen.value = true;
    };

    const onInitTransaction = async (password: string): Promise<void> => {
      isLoading.value = true;

      setTimeout(async () => {
        if (
          !accountJson.value ||
          !transactionData.value ||
          !recipient.value ||
          !amount.value ||
          !multisigAccountDetails.value
        ) {
          return;
        }
        try {
          await multisigStore.initMultisigTransaction({
            multisigAddress: props.address,
            recipient: recipient.value,
            callHash: transactionData.value.callHash,
            callData: transactionData.value.callData,
            sender: { account: accountJson.value, password },
            otherSignatories: multisigAccountDetails.value?.signatories
              .filter((item) => item.address !== address.value)
              .map((item) => item.address),
            threshold: multisigAccountDetails.value?.threshold,
            amount: amount.value
          });
  
          showSuccess('Successfully initiate transaction');
          router.push({ name: 'multisig.wallet' });
        } catch (error: any) {
          passwordError.value = error.message;
        } finally {
          isLoading.value = false;
        }
      }, 500);
      
    };

    const renderActiveView = () => {
      if (isDetailsViewOpen.value) {
        return (
          <MultisigActionSendFormDetails
            transactionData={transactionData.value}
            onClick:cancel={() => (isDetailsViewOpen.value = false)}
            onClick:confirm={() => (isConfirmActionModalOpen.value = true)}
          />
        );
      }
      return (
        <MultisigActionSendForm
          address={props.address}
          onClick:cancel={() => router.push({ name: 'multisig.wallet' })}
          onClick:confirm={onConfirm}
        />
      );
    };

    return () => (
      <>
        {renderActiveView()}

        <ConfirmActionModal
          title="Confirm transaction"
          isOpen={isConfirmActionModalOpen.value}
          isLoading={isLoading.value}
          error={passwordError.value}
          onClick:cancel={() => (isConfirmActionModalOpen.value = false)}
          onClick:confirm={onInitTransaction}
        />
      </>
    );
  }
});
