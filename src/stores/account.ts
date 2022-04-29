
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ApiService } from '@/services/ApiService';
import type { CreateResult } from '@polkadot/ui-keyring/types';

const apiService = ApiService.getInstance();

export const useAccountStore = defineStore('account', () => {

  const account = ref<CreateResult>();

  const address = computed(() => account?.value?.json?.address || '');
  const isLoggedIn = computed(() => !!address.value);

  function generateSeedPhrase(): string {
    return apiService.generateSeedPhrase();
  }

  function getOrCreateAccount(seed: string): void {
    account.value = apiService.getOrCreateAccountWithSeedPhrase(seed);
  }

  return {
    account,
    address,

    isLoggedIn,

    getOrCreateAccount,
    generateSeedPhrase
  };
}, {
  persistedState: {
    key: 'DEIP:account'
  }
});
