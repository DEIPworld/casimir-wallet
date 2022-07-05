import BigNumber from 'bignumber.js';
import Keyring from '@polkadot/ui-keyring';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { waitReady } from '@polkadot/wasm-crypto';
import {
  mnemonicGenerate,
  mnemonicValidate,
  mnemonicToMiniSecret,
  decodeAddress,
  encodeMultiAddress
} from '@polkadot/util-crypto';
import { u8aToHex, stringToU8a, hexToU8a } from '@polkadot/util';

import HttpService from './HttpService';

import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { KeyringPair$Json, KeyringPair } from '@polkadot/keyring/types';
import type {
  IAccount,
  IKeyPair,
  IVestingPlan,
  ITransaction,
  IMultisigTransactionData,
  IMultisigTransaction
} from '@/types';

import { singleton } from '@/utils/singleton';
import { emitter } from '@/utils/eventBus';
import type { BN } from '@polkadot/util';
import type { AccountInfo } from '@polkadot/types/interfaces/system/types';

export class ApiService {
  // this.api.consts
  // All runtime constants, e.g. this.api.consts.balances.existentialDeposit.
  // These are not functions, rather accessing the endpoint immediately
  // yields the result as defined.
  //
  // this.api.query
  // All chain state, e.g. this.api.query.system.account(accountId).
  //
  // this.api.tx
  // All extrinsics, e.g. this.api.tx.balances.transfer(accountId, value).
  // private api: ApiDecoration<ApiTypes> | any;
  private api: any;

  private static formatCurrency(currency: number | BN, negated = false): string {
    const rawNum = new BigNumber(currency as BigNumber.Value).shiftedBy(-18);
    const resNum = negated ? rawNum.negated() : rawNum;

    return resNum.toFormat(BigNumber.ROUND_FLOOR);
  }

  private static millisecondsToMonth(milliseconds: number): number {
    return Math.floor(milliseconds / 2.628e+9);
  }

  async loadApi(): Promise<void> {
    try {
      const provider = new WsProvider(import.meta.env.DW_NETWORK);
      this.api = await ApiPromise.create({ provider });
    } catch (error) {
      console.log('Unable to initiate an API service: ', error);
    }
  }

  // Must be initiated after *loadApi() call
  // In terms to handle a Keyring api to load the plain account
  loadKeyring(): void {
    try {
      Keyring.loadAll({
        ss58Format: 42,
        type: 'sr25519',
        isDevelopment: import.meta.env.DEV
      });
    } catch (error) {
      console.error('Unable to load Keyring. ', error);
    }
  }

  async init(): Promise<void> {
    await waitReady();
    await this.loadApi();
    this.loadKeyring();
  }

  // ////////////////////////

  generateSeedPhrase(numWords: 12 | 15 | 18 | 21 | 24 | undefined = 12): string {
    return mnemonicGenerate(numWords);
  }

  validateSeedPhrase(seedPhrase: string): boolean {
    return mnemonicValidate(seedPhrase);
  }

  signMessage(account: CreateResult, message: string): string {
    const signature = account.pair.sign(stringToU8a(message));
    const isValid = account.pair.verify(message, signature, account.pair.publicKey);

    if (!isValid) {
      throw new Error(`Signed message: ${message} is invalid`);
    }

    return u8aToHex(signature);
  }

  addAccount(seedPhrase: string, password?: string): CreateResult {
    if (this.validateSeedPhrase(seedPhrase)) {
      return Keyring.addUri(seedPhrase, password);
    }

    throw new Error(`The seed phrase "${seedPhrase}" is not valid`);
  }

  async restoreAccount(json: KeyringPair$Json, password: string): Promise<CreateResult> {
    return new Promise((resolve, reject) => {
      try {
        const pair: KeyringPair = Keyring.restoreAccount(json, password);

        const restoredAccount = Keyring.addPair(pair, password);
        resolve(restoredAccount);
      } catch (error) {
        reject(new Error('password is incorrect'));
      }
    });
  }

  addMultisigAccount(addresses: string[], threshold: number): string {
    return encodeMultiAddress(addresses, threshold);
  }

  async getAccountDao(address: string): Promise<any> {
    try {
      const publicKey = u8aToHex(decodeAddress(address));

      const { data } = await HttpService.get('/dao/get', { publicKey });

      return data;
    } catch (error) {
      console.log(error);
      return error as any;
    }
  }

  getAccountKeyPair(
    seedPhrase: string,
    address: string | undefined
  ): IKeyPair {
    if (!this.validateSeedPhrase(seedPhrase)) {
      throw new Error(`The seed phrase "${seedPhrase}" is not valid`);
    }

    return {
      privateKey: u8aToHex(mnemonicToMiniSecret(seedPhrase)),
      publicKey: u8aToHex(decodeAddress(address))
    };
  }

  transformAccountInfo(data: AccountInfo) {
    const calculateActualBalance = Number(data.data.free) - Number(data.data.feeFrozen);

    return {
      nonce: data.nonce.toNumber(),
      consumers: data.consumers.toNumber(),
      providers: data.providers.toNumber(),
      sufficients: data.sufficients.toNumber(),
      data: {
        free: ApiService.formatCurrency(data.data.free),
        reserved: ApiService.formatCurrency(data.data.reserved),
        miscFrozen: ApiService.formatCurrency(data.data.miscFrozen),
        feeFrozen: ApiService.formatCurrency(data.data.feeFrozen),
        actual: ApiService.formatCurrency(calculateActualBalance)
      }
    };
  }

  // ////////////////////////

  async getVestingPlan(address: string): Promise<IVestingPlan> {
    try {
      const { value } = await this.api.query.deipVesting.vestingPlans(address);

      return {

        // Duration of cliff, not allowed to withdraw
        cliffDuration: ApiService.millisecondsToMonth(Number(value.cliffDuration)),

        // Amount of tokens which will be released at startTime
        initialAmount: ApiService.formatCurrency(value.initialAmount),

        // Vesting interval (availability for the next unlock)
        interval: ApiService.millisecondsToMonth(Number(value.interval)),

        // Starting time for unlocking (vesting)
        startTime: Number(value.startTime),

        // End time of vesting period
        endTime: Number(value.startTime) + Number(value.totalDuration),

        // Total locked amount, including the initialAmount
        totalAmount: ApiService.formatCurrency(value.totalAmount),

        // Total duration of this vesting plan (in time)
        totalDuration: ApiService.millisecondsToMonth(Number(value.totalDuration)),

        // True if vesting amount is accumulated during cliff duration
        vestingDuringCliff: Boolean(value.vestingDuringCliff)

      };
    } catch (error) {
      console.error(error);
      return error as any;
    }
  }

  async claimVesting(account: CreateResult): Promise<string> {
    try {
      const hash = await this.api.tx.deipVesting
        .unlock()
        .signAndSend(account.pair);

      return hash.toString();
    } catch (error) {
      console.error(error);
      return error as any;
    }
  }

  async approveVestingClaim(data: {
    account: CreateResult,
    multisigAddress: string,
    threshold: number,
    otherSignatories: string[],
    isFirstApproval: boolean,
    isFinalApproval: boolean,
  }): Promise<IMultisigTransactionData> {
    const {
      account,
      multisigAddress,
      threshold,
      otherSignatories,
      isFirstApproval = true,
      isFinalApproval = false
    } = data;

    try {
      const transaction = await this.api.tx.deipVesting
        .unlock();

      const { weight } = await transaction
        .paymentInfo(multisigAddress);

      const callHash = u8aToHex(transaction.method.hash);
      const callData = transaction.method.toHex();

      let timePoint = null;

      if (!isFirstApproval) {
        const info = await this.api.query.multisig.multisigs(
          multisigAddress,
          hexToU8a(callHash)
        );
        timePoint = info.unwrap().when;
      }


      if (isFinalApproval) {
        await this.api.tx.multisig
          .asMulti(
            threshold,
            otherSignatories.sort(),
            timePoint,
            callData,
            false,
            parseInt(weight)
          )
          .signAndSend(account.pair);
      } else {
        await this.api.tx.multisig
          .approveAsMulti(
            threshold,
            otherSignatories.sort(),
            timePoint,
            callHash,
            parseInt(weight)
          )
          .signAndSend(account.pair);
      }

      return {
        callHash,
        callData
      };
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }

  async getAccountBalance(address: string): Promise<IAccount> {
    try {
      const res = await this.api.query.system.account(address);

      return this.transformAccountInfo(res);
    } catch (error) {
      console.error(error);
      return error as any;
    }
  }

  async getTransactionFee(
    recipient: string,
    address: string,
    amount: number
  ): Promise<string> {
    try {
      const { partialFee } = await this.api.tx.balances
        .transfer(recipient, amount)
        .paymentInfo(address);

      return ApiService.formatCurrency(partialFee);
    } catch (error) {
      console.error(error);
      return error as any;
    }
  }

  async makeTransaction(
    recipient: string,
    account: CreateResult,
    amount: number
  ): Promise<ITransaction> {
    try {
      const hash = await this.api.tx.balances
        .transfer(recipient, new BigNumber(amount).shiftedBy(18).toFixed())
        .signAndSend(account.pair);

      return {
        hash: hash.toHex(),
        to: recipient,
        date: new Date().getTime(),
        amount
      };
    } catch (error) {
      console.error(error);
      return error as any;
    }
  }

  async getMultisigTransactionFee(data: {
    isFirstApproval: boolean,
    isFinalApproval: boolean,
    callHash: string,
    callData: string,
    threshold: number,
    otherSignatories: string[],
    multisigAddress: string,
    personalAddress: string,
  }): Promise<string> {
    const {
      isFirstApproval,
      isFinalApproval,
      callHash,
      callData,
      threshold,
      otherSignatories,
      multisigAddress,
      personalAddress
    } = data;
    const weight = 640000000;

    if (isFinalApproval) {
      const info = await this.api.query.multisig.multisigs(multisigAddress, hexToU8a(callHash));
      const timePoint = info.unwrap().when;

      const { partialFee } = await this.api.tx.multisig
      .asMulti(threshold, otherSignatories.sort(), timePoint, callData, false, weight)
      .paymentInfo(personalAddress);

      return ApiService.formatCurrency(partialFee);
    }

    let timePoint = null;
    if (!isFirstApproval) {
      const info = await this.api.query.multisig.multisigs(multisigAddress, hexToU8a(callHash));
      timePoint = info.unwrap().when;
    }

    const { partialFee } = await this.api.tx.multisig
      .approveAsMulti(threshold, otherSignatories.sort(), timePoint, callHash, weight).
      paymentInfo(personalAddress);

    return ApiService.formatCurrency(partialFee);
  }

  createMultisigTransaction(recipient: string, amount: number): IMultisigTransactionData {
    const transaction = this.api.tx.balances.transfer(
      recipient,
      new BigNumber(amount).shiftedBy(18).toFixed()
    );

    return {
      callHash: u8aToHex(transaction.method.hash),
      callData: transaction.method.toHex()
    };
  }

  async approveMultisigTransaction(isFirstApproval: boolean, {
    callHash,
    recipient,
    amount,
    multisigAddress,
    account,
    otherSignatories,
    threshold
  }: IMultisigTransaction): Promise<void> {
    const { weight } = await this.api.tx.balances
      .transfer(recipient, amount)
      .paymentInfo(multisigAddress);
    let timePoint = null;

    if (!isFirstApproval) {
      const info = await this.api.query.multisig.multisigs(multisigAddress, hexToU8a(callHash));
      timePoint = info.unwrap().when;
    }

    await this.api.tx.multisig
      .approveAsMulti(threshold, otherSignatories.sort(), timePoint, callHash, parseInt(weight))
      .signAndSend(account.pair);
  }

  async approveAndSendMultisigTransaction({
    callHash,
    callData,
    recipient,
    amount,
    multisigAddress,
    account,
    otherSignatories,
    threshold
  }: IMultisigTransaction): Promise<void> {
    const { weight } = await this.api.tx.balances
      .transfer(recipient, amount)
      .paymentInfo(multisigAddress);

    const info = await this.api.query.multisig.multisigs(multisigAddress, hexToU8a(callHash));
    const timePoint = info.unwrap().when;

    await this.api.tx.multisig
      .asMulti(threshold, otherSignatories.sort(), timePoint, callData, false, parseInt(weight))
      .signAndSend(account.pair);
  }

  subscribeToBalance(address: string): void {
    try {
      this.api.query.system.account(address, (data: AccountInfo) => {
        emitter.emit(
          'wallet:balanceChange',
          this.transformAccountInfo(data)
        );
      });
    } catch (error) {
      console.error(error);
    }
  }
  
  getExistentialDeposit(): string {
    return ApiService.formatCurrency(this.api.consts.balances.existentialDeposit.toBigInt());
  }

  static readonly getInstance = singleton(() => new ApiService());

}
