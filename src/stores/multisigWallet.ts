import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { ApiService } from '@/services/ApiService';
import HttpService from '@/services/HttpService';

import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { IAccount, IMultisigTransactionData, IMultisigTransactionItem, ITransactionHistoryItem } from '../../types';

const apiService = ApiService.getInstance();

export const useMultisigWalletStore = defineStore('multisigBalance', () => {
  const balance = ref<IAccount | undefined>();
  const transactionHistory = ref<ITransactionHistoryItem[]>([]);
  const pendingApprovals = ref<IMultisigTransactionItem[]>([]);

  const freeBalance = computed(() =>
    parseFloat(balance.value?.data.free.replace(',', '') || '')
  );
  const actualBalance = computed(() =>
    parseFloat(balance.value?.data.actual.replace(',', '') || '')
  );

  const clear = () => {
    balance.value = undefined;
    pendingApprovals.value = [];
  };

  const getAccountBalance = async (address: string | undefined): Promise<void> => {
    if (address) {
      const res = await apiService.getAccountBalance(address);
      if (res) balance.value = res;
    }
  };

  const getTransactionHistory = async (address: string): Promise<void> => {
    const { data } = await HttpService.get('/transaction-history', { address });

    if (data) transactionHistory.value = data;
  };

  const getPendingApprovals = async (address: string): Promise<void> => {
    const { data } = await HttpService.get('/multisig-transaction', { address, status: 'pending' });

    if (data) pendingApprovals.value = data;
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
        recipient,
        amount,
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

    const { data: result } = await HttpService.post('/multisig-transaction/create', params);

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
      recipient: string,
      amount: number,
      callHash: string,
      callData: string,
      multisigAddress: string,
      otherSignatories: string[],
      threshold: number
    }
  ): Promise<any> => {
    const {
      sender: { account, password },
      callHash,
      callData,
      recipient,
      amount,
      multisigAddress,
      otherSignatories,
      threshold
    } = data;

    const restoredAccount: CreateResult = await apiService.restoreAccount(account, password);

    if (isFinalApprove) {
      await apiService.approveAndSendMultisigTransaction({
        callHash,
        callData,
        recipient,
        amount,
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
          recipient,
          amount,
          multisigAddress,
          account: restoredAccount,
          otherSignatories,
          threshold
        });
    }

    const params = {
      approverAddress: account.address
    };

    await HttpService.patch(`/multisig-transaction/approve/${transactionId}`, params);
  };

  const getExistentialDeposit = (): string => {
    return apiService.getExistentialDeposit();
  };

  return {
    balance,
    freeBalance,
    actualBalance,

    transactionHistory,
    pendingApprovals,

    getTransactionHistory,
    getAccountBalance,
    getTransactionFee,
    getPendingApprovals,

    createMultisigTransaction,
    initMultisigTransaction,
    approveMultisigTransaction,
    getExistentialDeposit,

    clear
  };
});
