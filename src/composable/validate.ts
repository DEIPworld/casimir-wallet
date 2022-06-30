import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import { mnemonicValidate } from '@polkadot/util-crypto';

export function useYup() {
  const makeError = (val: string | undefined) => {
    return {
      messages: val,
      error: !!val
    };
  };

  // ////////////////////////

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

  // ////////////////////////

  const mnemonicTest = (value: any) => mnemonicValidate(value);

  const mnemonicValidator = {
    message: 'Mnemonic phrase not valid',
    test: mnemonicTest
  };

  // ////////////////////////

  const thresholdTest = (value: any, { parent }: any): boolean => {
    /*
      threshold value should not be bigger than amount of signatories plus account who creates multisig wallet
    */
    return value <= parent.signatories?.length + 1;
  };

  const thresholdValidator = {
    message: 'Threshold should be lesser or equal to amount of signatories',
    test: thresholdTest
  };

  // ////////////////////////

  return {
    makeError,

    addressValidator,
    mnemonicValidator,
    thresholdValidator
  };
}
