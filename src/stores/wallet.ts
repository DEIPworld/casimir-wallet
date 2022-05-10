import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ApiService } from '@/services/ApiService';
import type { IAccount, ITransaction } from '../../types';
import { emitter } from '@/utils/eventBus';
import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { CreateResult } from '@polkadot/ui-keyring/types';

const apiService = ApiService.getInstance();

export const useWalletStore = defineStore('balance', () => {
  const balance = ref<IAccount | undefined>();
  const transactions = ref<ITransaction[]>([]);

  const clear = () => {
    balance.value = undefined;
    transactions.value = [];
  };

  // theoretically not required
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

  const makeTransaction = async (
    recipient: string,
    sender: {
      account: KeyringPair$Json,
      password: string,
    },
    amount: number
  ) => {
    const {
      account,
      password
    } = sender;

    const restoredAccount: CreateResult = apiService.restoreAccount(account, password);

    return await apiService.makeTransaction(
      recipient,
      restoredAccount,
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
    subscribeToTransfers,

    clear
  };
}, {
  persistedState: {
    key: 'DEIP:wallet'
  }
});
