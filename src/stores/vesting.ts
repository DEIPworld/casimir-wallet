import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ApiService } from '@/services/ApiService';
import type { IVestingPlan } from '../../types';
import type { CreateResult } from '@polkadot/ui-keyring/types';

const apiService = ApiService.getInstance();

export const useVestingStore = defineStore('vesting', () => {
  const vesting = ref<IVestingPlan | undefined>();

  const getVestingPlan = async (address: string | undefined): Promise<void> => {
    if (address) {
      const res = await apiService.getVestingPlan(address);
      if (res) vesting.value = res;
    }
  };

  const claimVesting = async (account: CreateResult) => {
    return await apiService.claimVesting(account);
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
