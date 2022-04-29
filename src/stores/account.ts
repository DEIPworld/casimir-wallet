
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ApiService } from '@/services/ApiService';

import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { KeyringPair$Meta } from '@polkadot/keyring/types';
import type { HexString } from '@polkadot/util/types';
import type { EncryptedJsonDescriptor } from '@polkadot/util-crypto/json/types';

const apiService = ApiService.getInstance();

export const useAccountStore = defineStore('account', () => {


  const address = ref<string | HexString>('');
  const encoded = ref<HexString | string>('');
  const encoding = ref<EncryptedJsonDescriptor>();
  const meta = ref<KeyringPair$Meta>();

  const isLoggedIn = computed(() => !!address.value);

  function generateSeedPhrase(): string {
    return apiService.generateSeedPhrase();
  }

  function getAccount(seed: string, save = true): void | CreateResult {
    const data = apiService.getOrCreateAccountWithSeedPhrase(seed);

    if (save) {
      address.value = data.json.address;
      encoded.value = data.json.encoded;
      encoding.value = data.json.encoding;
      meta.value = data.json.meta;

      return;
    }

    return data;
  }

  return {
    address,
    encoded,
    encoding,
    meta,

    isLoggedIn,

    generateSeedPhrase,
    getAccount
  };
}, {
  persistedState: {
    key: 'DEIP:account'
  }
});
