import Keyring from '@polkadot/ui-keyring';
import { mnemonicGenerate } from '@polkadot/util-crypto';

import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { WordCount } from '@polkadot/util-crypto/mnemonic/generate';

class KeyringService {

  load(): void {
    try {
      Keyring.loadAll({
        ss58Format: 42,
        type: 'sr25519',
        isDevelopment: true
      });
    } catch (error) {
      console.error('Unable to load Keyring. ', error);
    }
  }

  generateSeedPhrase(numWords: WordCount | undefined = 12): string {
    return mnemonicGenerate(numWords);
  }

  createAccount(): { seedPhrase: string } & CreateResult {
    const seedPhrase: string = this.generateSeedPhrase();

    return {
      seedPhrase,
      ...Keyring.addUri(seedPhrase)
    };
  }

  getAccount(seedPhrase: string): CreateResult {
    return Keyring.addUri(seedPhrase);
  }

}

export default new KeyringService();
