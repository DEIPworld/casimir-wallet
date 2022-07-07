import { defineComponent, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { TransactionHistory } from '@/components/TransactionHistory';

import { useAccountStore } from '@/stores/account';
import { useWalletStore } from '@/stores/wallet';
import { useNotify } from '@/composable/notify';

export const WalletTransactions = defineComponent({
  setup() {
    const accountStore = useAccountStore();
    const walletStore = useWalletStore();

    const { address } = storeToRefs(accountStore);
    const { transactionHistory } = storeToRefs(walletStore);

    const { showError } = useNotify();

    const isLoading = ref<boolean>(false);

    const onLoadHistory = async (page: number): Promise<void> => {
      if (address.value) {
        isLoading.value = true;

        try {
          walletStore.getTransactionHistory({ address: address.value, page });
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
