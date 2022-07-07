import { defineComponent, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { TransactionHistory } from '@/components/TransactionHistory';

import { useAccountStore } from '@/stores/account';
import { useMultisigWalletStore } from '@/stores/multisigWallet';
import { useNotify } from '@/composable/notify';

export const MultisigTransactions = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const multisigStore = useMultisigWalletStore();

    const { multisigAccountDetails } = storeToRefs(accountStore);
    const { transactionHistory } = storeToRefs(multisigStore);

    const { showError } = useNotify();

    const isLoading = ref<boolean>(false);

    const onLoadHistory = async (page: number): Promise<void> => {
      if (multisigAccountDetails.value) {
        isLoading.value = true;

        try {
          multisigStore.getTransactionHistory({
            address: multisigAccountDetails.value.address,
            page
          });
        } catch (error) {
          showError('Error loading transaction history');
          console.error(error);
        } finally {
          isLoading.value = false;
        }
      }
    };

    return () => (
      <TransactionHistory transactionHistory={transactionHistory.value} onLoad={onLoadHistory} />
    );
  }
});
