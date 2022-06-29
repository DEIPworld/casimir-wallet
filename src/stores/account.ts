import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ApiService } from '@/services/ApiService';
import HttpService from '@/services/HttpService';

import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { IMultisigWallet, ISignatory } from '../../types/';

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

    async function createMultisigAccount(
      addresses: ISignatory[],
      threshold: number,
      name: string
    ): Promise<IMultisigWallet> {
      if (!address.value) {
        throw new Error('user address is not defined');
      }

      const signatories = [{ name: 'Owner', address: address.value }, ...addresses];
      const multisigAddress = apiService.addMultisigAccount(
        signatories.map((signatory) => signatory.address),
        threshold
      );

      const { data } = await HttpService.post('/multisig/create', {
        address: multisigAddress,
        threshold,
        name,
        signatories
      });

      return data;
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
      createMultisigAccount,

      logOut
    };
  },
  {
    persistedState: {
      key: 'DEIP:account',
      includePaths: ['accountJson']
    }
  });

