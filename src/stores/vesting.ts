import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ApiService } from '@/services/ApiService';
import type { IVestingPlan } from '../../types';

const apiService = ApiService.getInstance();

export const useVestingStore = defineStore('vesting', () => {
  const vesting = ref<IVestingPlan | undefined>();

  const getVestingPlan = async (address: string | undefined): Promise<void> => {
    if (address) {
      const res = await apiService.getVestingPlan(address);
      if (res) vesting.value = res;
    }
  };

  return {
    vesting,

    getVestingPlan
  };
}, {
  persistedState: {
    key: 'DEIP:accountBalance'
  }
});
