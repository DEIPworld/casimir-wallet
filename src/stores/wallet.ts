import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ApiService } from '@/services/ApiService';
import type { IAccount } from '../../types';
import { emitter } from '@/utils/eventBus';
import type { CreateResult } from '@polkadot/ui-keyring/types';

const apiService = ApiService.getInstance();

export const useWalletStore = defineStore('balance', () => {
  const balance = ref<IAccount | undefined>();
  const transactions = ref<Record<string, string>[]>([]);

  const getAccountBalance = async (address: string | undefined): Promise<void> => {
    if (address) {
      const res = await apiService.getAccountBalance(address);
      if (res) balance.value = res;
    }
  };

  const subscribeToBalance = async (address: string) => {
    balance.value = await apiService.getAccountBalance(address);

    await new Promise(resolve => setTimeout(resolve, 1000));
    await subscribeToBalance(address);
  };

  const subscribeToTransfers = (address: string) => {
    apiService.subscribeToTransfers(address);
    emitter.on('transaction', (data: Record<string, string>) => {
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

  const makeTransaction = async (
    recipient: string,
    account: CreateResult,
    amount: number
  ) => {
    return await apiService.makeTransaction(
      recipient,
      account,
      amount
    );
  };

  return {
    balance,
    transactions,

    getAccountBalance,
    getTransactionFee,
    makeTransaction,

    subscribeToUpdates,
    subscribeToBalance,
    subscribeToTransfers
  };
}, {
  persistedState: {
    key: 'DEIP:wallet'
  }
});
