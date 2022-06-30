import { defineStore } from 'pinia';
import { ref } from 'vue';

import { ApiService } from '@/services/ApiService';
import HttpService from '@/services/HttpService';

import type { IVestingPlan, IMultisigVestingItem } from '../../types';
import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

const apiService = ApiService.getInstance();

export const useVestingStore = defineStore('vesting', () => {
  const vesting = ref<IVestingPlan | undefined>();
  const pendingApprovals = ref<IMultisigVestingItem[]>([]);

  const getVestingPlan = async (address: string | undefined): Promise<void> => {
    if (address) {
      const res = await apiService.getVestingPlan(address);
      if (res) vesting.value = res;
    }
  };

  const getPendingApprovals = async(address: string | undefined): Promise<void> => {
    if (address) {
      const { data } = await HttpService.get('/multisig-vesting', { address, status: 'pending' });

      if (data) pendingApprovals.value = data;
    }
  };

  // const claimVesting = async (account: CreateResult) => {
  //   return await apiService.claimVesting(account);
  // };

  const claimVesting = async (
    account: KeyringPair$Json,
    password: string
  ) => {
    const restoredAccount: CreateResult = await apiService.restoreAccount(account, password);

    return await apiService.claimVesting(restoredAccount);
  };

  const approveVestingClaim = async (data: {
    sender: { account: KeyringPair$Json, password: string },
    multisigAddress: string,
    threshold: number,
    otherSignatories: string[],
  }): Promise<any> => {
    const { multisigAddress, threshold, otherSignatories } = data;
    const { account, password } = data.sender;

    const restoredAccount: CreateResult = await apiService.restoreAccount(account, password);

    const { data: pendingApproval } = await HttpService.get(`/multisig-vesting/address/${multisigAddress}`, { status: 'pending' });

    if (pendingApproval?.signatories?.includes(account.address)) {
      return;
    }

    if (pendingApproval) {
      await apiService.approveVestingClaim({
        account: restoredAccount,
        multisigAddress,
        threshold,
        otherSignatories,
        isFirstApproval: false,
        isFinalApproval: pendingApproval.approvals +1 >= pendingApproval.threshold
      });

      await HttpService.patch(`/multisig-vesting/approve/${pendingApproval._id}`, {
        approverAddress: account.address
      });
    } else {
      const { callHash, callData } = await apiService.approveVestingClaim({
        account: restoredAccount,
        multisigAddress,
        threshold,
        otherSignatories,
        isFirstApproval: true,
        isFinalApproval: false
      });

      await HttpService.post('/multisig-vesting/create', {
        address: multisigAddress,
        threshold,
        initiator: account.address,
        callHash,
        callData
      });
    }
  };

  return {
    vesting,
    pendingApprovals,

    getVestingPlan,
    getPendingApprovals,
    claimVesting,
    approveVestingClaim
  };
}, {
  persistedState: {
    key: 'DEIP:accountBalance'
  }
});
