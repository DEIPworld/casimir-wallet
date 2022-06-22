import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ApiService } from '@/services/ApiService';
import { DeipService } from '@/services/DeipService';

import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { CreateResult } from '@polkadot/ui-keyring/types';

const apiService = ApiService.getInstance();
const deipService = DeipService.getInstance();

export const useAccountStore = defineStore(
  'account',
  () => {
    const accountJson = ref<KeyringPair$Json>();
    const accountDAO = ref();

    const tempSeed = ref<string>('');

    const address = computed(() => accountJson?.value?.address);
    const isLoggedIn = computed(() => !!address.value);

    function generateSeedPhrase(): string {
      return apiService.generateSeedPhrase();
    }

    async function addAccount(seedPhrase: string, password: string): Promise<void> {
      const { json } = apiService.addAccount(seedPhrase, password);
      const DAO = await apiService.getAccountDAO(json.address);

      accountJson.value = json;
      accountDAO.value = DAO;
    }

    function restoreAccount(json: KeyringPair$Json, password: string): Promise<CreateResult> {
      return apiService.restoreAccount(json, password);
    }

    async function connectPortal(portal: any): Promise<void> {
      const keys = apiService.getAccountKeyPair(tempSeed.value, address.value);

      const DAO = await deipService.createDaoTransactionMessage({
        address: address.value,
        publicKey: keys.publicKey.slice(2),
        privateKey: keys.privateKey.slice(2),
        portal
      });

      accountDAO.value = DAO;

      return DAO;
    }

    function logOut() {
      accountJson.value = undefined;
      accountDAO.value = undefined;
    }

    return {
      accountJson,
      accountDAO,

      tempSeed,

      address,
      isLoggedIn,

      generateSeedPhrase,
      connectPortal,

      addAccount,
      restoreAccount,
      logOut
    };
  },
  {
    persistedState: {
      key: 'DEIP:account',
      includePaths: ['accountJson', 'accountDAO']
    }
  });

