import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { ApiService } from '@/services/ApiService';
import HttpService from '@/services/HttpService';
import { emitter } from '@/utils/eventBus';

import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { IAccount, ITransaction, IMultisigTransactionData, IMultisigTransactionObject } from '../../types';

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

  const createMultisigTransaction = (
    recipient: string,
    amount: number
  ): IMultisigTransactionData => {
    return apiService.createMultisigTransaction(recipient, amount);
  };

  const initMultisigTransaction = async (data: {
    multisigAddress: string,
    recipient: string,
    callHash: string,
    callData: string,
    sender: {
      account: KeyringPair$Json,
      password: string,
    },
    otherSignatories: string[],
    threshold: number,
    amount: number
  }): Promise<any> => {
    const {
      multisigAddress,
      recipient,
      callData,
      callHash,
      sender,
      otherSignatories,
      threshold,
      amount
    } = data;

    const {
      account,
      password
    } = sender;

    const restoredAccount: CreateResult = await apiService.restoreAccount(account, password);

    await apiService.approveMultisigTransaction(
      true,
      {
        callHash,
        multisigAddress,
        account: restoredAccount,
        otherSignatories,
        threshold
      });

    const params = {
      address: multisigAddress,
      recipient,
      amount,
      initiator: account.address,
      threshold,
      callHash,
      callData
    };

    const { data: result } = await HttpService.post('/transaction/create', params);

    return result;
  };

  const approveMultisigTransaction = async (
    transactionId: string,
    isFinalApprove: boolean,
    data: {
      sender: {
        account: KeyringPair$Json,
        password: string,
      },
      callHash: string,
      callData: string,
      multisigAddress: string,
      otherSignatories: string[],
      threshold: number
    }
  ): Promise<any> => {
    const { sender, callHash, callData, multisigAddress, otherSignatories, threshold } = data;
    const {
      account,
      password
    } = sender;

    const restoredAccount: CreateResult = await apiService.restoreAccount(account, password);

    if (isFinalApprove) {
      await apiService.approveAndSendMultisigTransaction({
        callHash,
        callData,
        multisigAddress,
        account: restoredAccount,
        otherSignatories,
        threshold
      });
    } else {
      await apiService.approveMultisigTransaction(
        false,
        {
          callHash,
          multisigAddress,
          account: restoredAccount,
          otherSignatories,
          threshold
        });
    }

    const params = {
      approverAddress: account.address
    };

    await HttpService.patch(`/transaction/approve/${transactionId}`, params);
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

    createMultisigTransaction,
    initMultisigTransaction,
    approveMultisigTransaction,
    subscribeToTransfers,

    unsubscribeFromTransfers,
    clear
  };
});
