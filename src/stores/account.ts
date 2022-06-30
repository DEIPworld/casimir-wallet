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
    const accountDao = ref();

    const tempSeed = ref<string>('');

    const address = computed(() => accountJson?.value?.address);
    const isLoggedIn = computed(() => !!address.value);

    function generateSeedPhrase(): string {
      return apiService.generateSeedPhrase();
    }

    async function addAccount(seedPhrase: string, password: string): Promise<void> {
      const { json } = apiService.addAccount(seedPhrase, password);
      const DAO = await apiService.getAccountDao(json.address);

      accountJson.value = json;
      accountDao.value = DAO;
    }

    function restoreAccount(json: KeyringPair$Json, password: string): Promise<CreateResult> {
      return apiService.restoreAccount(json, password);
    }

    async function connectPortal(portal: any): Promise<string> {
      const keys = apiService.getAccountKeyPair(tempSeed.value, address.value);
      const account = apiService.addAccount(tempSeed.value);
      const signature = apiService.signMessage(account, portal.seed);

      accountDao.value = await deipService.createDaoTransactionMessage({
        address: address.value,
        publicKey: keys.publicKey.slice(2),
        privateKey: keys.privateKey.slice(2),
        portal
      });

      return signature;
    }

    function logOut() {
      accountJson.value = undefined;
      accountDao.value = undefined;
    }

    return {
      accountJson,
      accountDao,

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

