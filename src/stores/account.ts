import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ApiService } from '@/services/ApiService';
import HttpService from '@/services/HttpService';

import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { IMultisigWallet } from '../../types/';

const apiService = ApiService.getInstance();

export const useAccountStore = defineStore(
  'account',
  () => {
    const accountJson = ref<KeyringPair$Json>();
    const multisigAccounts = ref<IMultisigWallet[]>();
    const multisigAccountDetails = ref<IMultisigWallet>();

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

    async function getMultisigAccounts(): Promise<void> {
      const { data } = await HttpService.get('/multisig/getUserMultisig', { address: address.value });

      multisigAccounts.value = data;
    }

    async function getMultisigAccountDetails(walletAddress: string): Promise<void> {
      const { data } = await HttpService.get('/multisig/getById', { address: walletAddress });

      multisigAccountDetails.value = data;
    }

    function logOut() {
      accountJson.value = undefined;
    }

    return {
      accountJson,
      multisigAccounts,
      multisigAccountDetails,

      tempSeed,

      address,
      isLoggedIn,

      generateSeedPhrase,

      addAccount,
      restoreAccount,
      getMultisigAccounts,
      getMultisigAccountDetails,

      logOut
    };
  },
  {
    persistedState: {
      key: 'DEIP:account',
      includePaths: ['accountJson']
    }
  });

