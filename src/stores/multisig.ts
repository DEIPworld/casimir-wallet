import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ApiService } from '@/services/ApiService';
import type { IAccount, ITransaction } from '../../types';
import { emitter } from '@/utils/eventBus';

const apiService = ApiService.getInstance();

export const useMultisigWalletStore = defineStore('multisigBalance', () => {
  const balance = ref<IAccount | undefined>();
  const transactions = ref<ITransaction[]>([]);
  const pendingApprovals = ref<any[]>([1, 2, 3]); // TODO: add type when schema is defined

  const freeBalance = computed(() =>
    parseFloat(balance.value?.data.free.replace(',', '') || '')
  );
  const actualBalance = computed(() =>
    parseFloat(balance.value?.data.actual.replace(',', '') || '')
  );

  const clear = () => {
    balance.value = undefined;
    transactions.value = [];
  };

  // TODO: maybe better to request balance instead of subscribing (as there might be several multisig accounts)?
  const getAccountBalance = async (address: string | undefined): Promise<void> => {
    if (address) {
      const res = await apiService.getAccountBalance(address);
      if (res) balance.value = res;
    }
  };

  const subscribeToBalance = async (address: string) => {
    apiService.subscribeToBalance(address);

    emitter.on('wallet:balanceChange', (data: IAccount) => {
      balance.value = data;
    });
  };

  const subscribeToTransfers = (address: string) => {
    apiService.subscribeToTransfers(address);

    emitter.on('wallet:transfer', (data: ITransaction) => {
      transactions.value.push(data);
    });
  };

  const subscribeToUpdates = (address: string) => {
    subscribeToBalance(address);
    subscribeToTransfers(address);
  };

  const getTransactionFee = async (
    recipient: string,
    address: string,
    amount: number
  ) => {
    return await apiService.getTransactionFee(
      recipient,
      address,
      amount
    );
  };

  return {
    balance,
    freeBalance,
    actualBalance,

    transactions,
    pendingApprovals,

    getTransactionFee,
    getAccountBalance,

    subscribeToUpdates,
    subscribeToTransfers,

    clear
  };
});
