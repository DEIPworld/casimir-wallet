import type { EncryptedJsonDescriptor } from '@polkadot/util-crypto/json/types';
import type { KeyringPair$Meta } from '@polkadot/keyring/types';
import type { HexString } from '@polkadot/util/types';

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ApiService } from '@/services/ApiService';

const apiService = ApiService.getInstance();

export const useAccountStore = defineStore('account', () => {
  const address = ref<string | HexString>();
  const encoded = ref<string | HexString>();
  const encoding = ref<EncryptedJsonDescriptor>();
  const meta = ref<KeyringPair$Meta>();

  const isLoggedIn = computed(() => !!address.value);

  function generateSeedPhrase(): string {
    return apiService.generateSeedPhrase();
  }

  function getOrCreateAccount(seed: string): void {
    const { json } = apiService.getOrCreateAccountWithSeedPhrase(seed);

    address.value = json.address;
    encoded.value = json.encoded;
    encoding.value = json.encoding;
    meta.value = json.meta;
  }

  return {
    address,
    encoded,
    encoding,
    meta,

    isLoggedIn,

    getOrCreateAccount,
    generateSeedPhrase
  };
}, {
  persistedState: {
    key: 'DEIP:account'
  }
});
