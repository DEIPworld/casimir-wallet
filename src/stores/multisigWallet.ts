import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { ApiService } from '@/services/ApiService';
import HttpService from '@/services/HttpService';
import { emitter } from '@/utils/eventBus';

import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { IAccount, ITransaction } from '../../types';

const apiService = ApiService.getInstance();

export const useMultisigWalletStore = defineStore('multisigBalance', () => {
  const balance = ref<IAccount | undefined>();
  const transactions = ref<ITransaction[]>([]);
  const pendingApprovals = ref<any[]>([]); // TODO: add type when schema is defined

  const freeBalance = computed(() =>
    parseFloat(balance.value?.data.free.replace(',', '') || '')
  );
  const actualBalance = computed(() =>
    parseFloat(balance.value?.data.actual.replace(',', '') || '')
  );

  const clear = () => {
    balance.value = undefined;
    transactions.value = [];
    pendingApprovals.value = [];
  };

  const getAccountBalance = async (address: string | undefined): Promise<void> => {
    if (address) {
      const res = await apiService.getAccountBalance(address);
      if (res) balance.value = res;
    }
  };

  const getPendingApprovals = async (address: string): Promise<void> => {
    const { data } = await HttpService.get('/transaction', { address, status: 'pending' });

    if (data) pendingApprovals.value = data;
  };

  const subscribeToTransfers = (address: string) => {
    apiService.subscribeToTransfers(address);

    emitter.on(`wallet:transfer:${address}`, (data: ITransaction) => {
      transactions.value.push(data);
    });
  };

  const unsubscribeFromTransfers = (address: string) => {
    apiService.unsubscribeFromTransfers(address);
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

  const initMultisigTransaction = async (
    recipient: string,
    sender: {
      account: KeyringPair$Json,
      password: string,
    },
    otherSignatories: any[],
    threshold: number,
    amount: number
  ): Promise<any> => {
    const {
      account,
      password
    } = sender;

    const restoredAccount: CreateResult = await apiService.restoreAccount(account, password);

    const { callHash, callData } = await apiService.initMultisigTransaction(
      recipient,
      restoredAccount,
      otherSignatories,
      threshold,
      amount
    );

    const data = {
      address: '5H7nVfrWNcDdVAwZt1FJd7joBehjMbuT5j9AFtp2ixDH1wsv', //TODO: replace with multisig address
      recipient,
      amount,
      initiator: account.address,
      threshold,
      callHash,
      callData
    };

    const { data: result } = await HttpService.post('/transaction/create', data);

    return result;
  };

  const approveMultisigTransaction = async (
    sender: {
      account: KeyringPair$Json,
      password: string,
    },
    otherSignatories: any[],
    threshold: number
  ): Promise<any> => {
    const {
      account,
      password
    } = sender;

    const restoredAccount: CreateResult = await apiService.restoreAccount(account, password);

    return await apiService.approveMultisigTransaction(
      restoredAccount,
      otherSignatories,
      threshold
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
    getPendingApprovals,

    initMultisigTransaction,
    approveMultisigTransaction,
    subscribeToTransfers,

    unsubscribeFromTransfers,
    clear
  };
});
