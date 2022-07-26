import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ApiService } from '@/services/ApiService';
import { DeipService } from '@/services/DeipService';
import HttpService from '@/services/HttpService';
import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { IMultisigWallet, ISignatory, IKeyPair } from '@/types';
import { Keyring } from '@polkadot/api';

const apiService = ApiService.getInstance();
const deipService = DeipService.getInstance();

export const useAccountStore = defineStore(
  'account',
  () => {
    const accountJson = ref<KeyringPair$Json>();
    const accountDao = ref();
    const accountKeys = ref<IKeyPair>();
    const multisigAccounts = ref<IMultisigWallet[]>();
    const multisigAccountDetails = ref<IMultisigWallet>();

    const tempSeed = ref<string>('');

    const address = computed(() => accountJson?.value?.address);
    const isLoggedIn = computed(() => !!address.value);

    function generateSeedPhrase(): string {
      return apiService.generateSeedPhrase();
    }

    async function addAccount(seedPhrase: string, password: string): Promise<void> {
      const { json } = apiService.addAccount(seedPhrase, password);
      const keys = apiService.getAccountKeyPair(seedPhrase, json.address);

      accountDao.value = await apiService.getAccountDao(json.address);
      accountJson.value = json;
      accountKeys.value = keys;
    }

    function restoreAccount(json: KeyringPair$Json, password: string): Promise<CreateResult> {
      return apiService.restoreAccount(json, password);
    }

    async function connectPortal(portal: any): Promise<{
      secretSigHex: string,
      publicKey: string
    }> {
      try {
        const keys = apiService.getAccountKeyPair(tempSeed.value, address.value);
        const account = apiService.addAccount(tempSeed.value);
        const secretSigHex = apiService.signMessage(account, portal.seed);

        const publicKey = keys.publicKey.slice(2);
        const privateKey = keys.privateKey.slice(2);

        accountDao.value = await deipService.createDaoTransactionMessage({
          address: address.value,
          publicKey,
          privateKey,
          portal
        });

        const keyring = new Keyring({ type: 'sr25519' });
        const keyringPair = keyring.addFromUri(`0x${privateKey}`);
        const daoAddress = deipService.daoIdToAddress(accountDao.value.daoId);
        // TODO: check settings for PROD/TEST environments
        const prefundingAmount = import.meta.env.DW_ACCOUNT_DEFAULT_FUNDING_AMOUNT ? import.meta.env.DW_ACCOUNT_DEFAULT_FUNDING_AMOUNT : "1000000000000000000000";
        await apiService.prefundAddress(keyringPair, daoAddress, prefundingAmount);

        return { secretSigHex, publicKey };
      } catch (error) {
        console.log(error);
        return error as any;
      }
    }

    function signTransaction(packedTx: any): Promise<any> {
      return deipService.signTransaction(packedTx, accountKeys?.value?.privateKey);
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

      await getMultisigAccounts();

      return data;
    }

    function logOut() {
      accountJson.value = undefined;
      accountDao.value = undefined;
    }

    return {
      accountJson,
      accountDao,
      accountKeys,
      multisigAccounts,
      multisigAccountDetails,

      tempSeed,

      address,
      isLoggedIn,

      generateSeedPhrase,
      connectPortal,

      addAccount,
      restoreAccount,
      getMultisigAccounts,
      getMultisigAccountDetails,
      createMultisigAccount,
      signTransaction,

      logOut
    };
  },
  {
    persistedState: {
      key: 'DEIP:account',
      includePaths: ['accountJson', 'accountDao', 'accountKeys']
    }
  });

