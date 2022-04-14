import Keyring from '@polkadot/ui-keyring';
import { mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto';

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

  validateSeedPhrase(seedPhrase: string): boolean {
    return mnemonicValidate(seedPhrase);
  }

  selectWordFromSeedPhrase(seedPhrase: string): { wordNum: number, word: string } {
    const words: string[] = seedPhrase.split(' ');
    const min = 0;
    const max: number = words.length - 1;
    const index: number = Math.floor(Math.random() * (max - min) + min);

    return {
      wordNum: index + 1,
      word: words[index]
    };
  }

  getAccount(seedPhrase: string): CreateResult | Error {
    if (this.validateSeedPhrase(seedPhrase)) {
      return Keyring.addUri(seedPhrase);
    }

    return Error(`The seed phrase "${seedPhrase}" is not valid`);
  }

}

export default new KeyringService();
