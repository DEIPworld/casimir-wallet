import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ChainService } from '@/services/ChainService';
import type { IVestingPlan } from '../../types';
import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

const chainService = ChainService.getInstance();

export const useVestingStore = defineStore('vesting', () => {
  const vesting = ref<IVestingPlan | undefined>();

  const getVestingPlan = async (address: string | undefined): Promise<void> => {
    if (address) {
      const res = await chainService.getVestingPlan(address);
      if (res) vesting.value = res;
    }
  };

  // const claimVesting = async (account: CreateResult) => {
  //   return await chainService.claimVesting(account);
  // };

  const claimVesting = async (
    account: KeyringPair$Json,
    password: string
  ) => {
    const restoredAccount: CreateResult = await chainService.restoreAccount(account, password);

    return await chainService.claimVesting(restoredAccount);
  };

  return {
    vesting,

    getVestingPlan,
    claimVesting
  };
}, {
  persistedState: {
    key: 'DEIP:accountBalance'
  }
});
