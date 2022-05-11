import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';

export function useYup() {
  const addressTest = (value: any) => {
    try {
      encodeAddress(
      isHex(value)
        ? hexToU8a(value)
        : decodeAddress(value)
      );

      return true;
    } catch (error) {
      return false;
    }
  };

  const addressValidator = {
    message: 'Address not valid',
    test: addressTest
  };

  return {
    addressValidator
  };
}
