import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { ChainService } from '@/services/ChainService';

import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { CreateResult } from '@polkadot/ui-keyring/types';

const chainService = ChainService.getInstance();

export const useAccountStore = defineStore(
  'account',
  () => {
    const accountJson = ref<KeyringPair$Json>();

    const tempSeed = ref<string>('');

    const address = computed(() => accountJson?.value?.address);
    const isLoggedIn = computed(() => !!address.value);

    function generateSeedPhrase(): string {
      return chainService.generateSeedPhrase();
    }

    function addAccount(seedPhrase: string, password: string): void {
      const { json } = chainService.addAccount(seedPhrase, password);
      accountJson.value = json;
    }

    function restoreAccount(json: KeyringPair$Json, password: string): Promise<CreateResult> {
      return chainService.restoreAccount(json, password);
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

