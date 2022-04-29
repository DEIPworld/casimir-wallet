import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ApiService } from '@/services/ApiService';
import type { IAccount } from '../../types';

const apiService = ApiService.getInstance();

export const useBalanceStore = defineStore('balance', () => {
  const balance = ref<IAccount | undefined>();

  const getAccountBalance = async (address: string | undefined): Promise<void> => {
    if (address) {
      const res = await apiService.getAccountBalance(address);
      if (res) balance.value = res;
    }
  };

  return {
    balance,

    getAccountBalance
  };
}, {
  persistedState: {
    key: 'DEIP:accountBalance'
  }
});
