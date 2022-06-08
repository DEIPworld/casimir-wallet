import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { ApiService } from '@/services/ApiService';

import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { CreateResult } from '@polkadot/ui-keyring/types';

const apiService = ApiService.getInstance();

export const useAccountStore = defineStore(
  'account',
  () => {
    const accountJson = ref<KeyringPair$Json>();

    const tempSeed = ref<string>('');

    const address = computed(() => accountJson?.value?.address);
    const isLoggedIn = computed(() => !!address.value);

    function generateSeedPhrase(): string {
      return apiService.generateSeedPhrase();
    }

    function addAccount(seedPhrase: string, password: string): void {
      const { json } = apiService.addAccount(seedPhrase, password);
      accountJson.value = json;
    }

    function restoreAccount(json: KeyringPair$Json, password: string): Promise<CreateResult> {
      return apiService.restoreAccount(json, password);
    }

    function logOut() {
      accountJson.value = undefined;
    }

    return {
      accountJson,

      tempSeed,

      address,
      isLoggedIn,

      generateSeedPhrase,

      addAccount,
      restoreAccount,
      logOut
    };
  },
  {
    persistedState: {
      key: 'DEIP:account',
      includePaths: ['accountJson']
    }
  });

