import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { ApiService } from '@/services/ApiService';
import HttpService from '@/services/HttpService';

import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { IAccount, IMultisigTransaction, IMultisigTransactionData, IMultisigTransactionItem, ITransactionHistoryItem } from '../../types';

const apiService = ApiService.getInstance();

export const useMultisigWalletStore = defineStore('multisigBalance', () => {
  const balance = ref<IAccount | undefined>();
  const transactionHistory = ref<ITransactionHistoryItem[]>([]);
  const pendingApprovals = ref<IMultisigTransactionItem[]>([]);

  const freeBalance = computed(() =>
    parseFloat(balance.value?.data.free.replace(/,/g, '') || '')
  );
  const actualBalance = computed(() =>
    parseFloat(balance.value?.data.actual.replace(/,/g, '') || '')
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

  const getTransactionHistory = async (data: { address: string, page: number }): Promise<void> => {
    const { data: result } = await HttpService.get('/transaction-history', data);

    if (result) {
      data.page > 1
        ? transactionHistory.value = transactionHistory.value.concat(result)
        : transactionHistory.value = result;
    }
  };

  const getPendingApprovals = async (address: string): Promise<void> => {
    const { data } = await HttpService.get('/multisig-transaction', { address, status: 'pending' });

    if (data) pendingApprovals.value = data;
  };

  const getMultisigTransactionFee = async (data: {
    isFirstApproval: boolean,
    isFinalApproval: boolean,
    callHash: string,
    callData: string,
    threshold: number,
    otherSignatories: string[],
    multisigAddress: string,
    personalAddress: string,
  }): Promise<string> => {
    return apiService.getMultisigTransactionFee(data);
  };

  const getDepositInfo = async (
    address: string,
    threshold: number
  ): Promise<any> => {
    return await apiService.getDepositInfo(address, threshold);
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
        callData,
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
    getPendingApprovals(account.address);
    getAccountBalance(account.address);

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
    getPendingApprovals(account.address);
    getAccountBalance(account.address);
  };

  const cancelMultisigTransaction = async (
    transactionId: string,
    data: {
      sender: {
        account: KeyringPair$Json,
        password: string,
      },
      callHash: string,
      multisigAddress: string,
      otherSignatories: string[],
      threshold: number
    }
  ): Promise<void> => {
    const {
      sender: { account, password },
      callHash,
      multisigAddress,
      otherSignatories,
      threshold
    } = data;

    const restoredAccount: CreateResult = await apiService.restoreAccount(account, password);
    await apiService.cancelMultisigTransaction({
      callHash,
      multisigAddress,
      account: restoredAccount,
      otherSignatories,
      threshold
    });

    await HttpService.post(`/multisig-transaction/cancel/${transactionId}`);
    getPendingApprovals(account.address);
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
    getMultisigTransactionFee,
    getAccountBalance,
    getDepositInfo,
    getPendingApprovals,

    createMultisigTransaction,
    initMultisigTransaction,
    approveMultisigTransaction,
    cancelMultisigTransaction,
    getExistentialDeposit,

    clear
  };
});
