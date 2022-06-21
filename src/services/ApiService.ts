import BigNumber from 'bignumber.js';
import Keyring from '@polkadot/ui-keyring';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { waitReady } from '@polkadot/wasm-crypto';
import {
  mnemonicGenerate,
  mnemonicValidate,
  mnemonicToMiniSecret,
  decodeAddress,
  encodeAddress,
  encodeMultiAddress,
  createKeyMulti,
  sortAddresses
} from '@polkadot/util-crypto';
import { u8aToHex, hexToU8a } from '@polkadot/util';

import { singleton } from '@/utils/singleton';
import { emitter } from '@/utils/eventBus';

import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { KeyringPair$Json, KeyringPair } from '@polkadot/keyring/types';
import type { IAccount, IKeyPair, IVestingPlan, ITransaction } from '../../types';

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

  private activeAddresses: Set<string> = new Set();

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

  addAccount(seedPhrase: string, password: string): CreateResult {
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

  getAccountKeyPair(
    seedPhrase: string,
    address: string
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
        .transfer(recipient, new BigNumber(amount).shiftedBy(18).toString())
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

  async initMultisigTransaction(
    recipient: string,
    account: CreateResult,
    otherSignatories: any[],
    threshold: number,
    amount: number
  ): Promise<any> {
    try {
      const weight = 640000000; //TODO: calculate if possible or set fixed value
      const transaction = this.api.tx.balances.transfer(
        recipient,
        new BigNumber(amount).shiftedBy(18).toString()
      );
  
      const txHash = await this.api.tx.multisig
        .approveAsMulti(threshold, otherSignatories.sort(), null, transaction.method.hash, weight) // TODO: sort other signatories by using polkadot utils method
        .signAndSend(account.pair);
  
      console.clear();
      console.log("DATA");
      console.log(u8aToHex(txHash));
      console.log(u8aToHex(transaction.method.hash));
      console.log(transaction.method.toHex());

      return {
        callHash: u8aToHex(transaction.method.hash),
        callData: transaction.method.toHex()
      };
    } catch (error) {
      console.clear();
      console.error(error);
    }
  }

  async approveMultisigTransaction(
    account: CreateResult,
    otherSignatories: any[],
    threshold: number
  ): Promise<any> {
    const weight = 640000000; //TODO: calculate if possible or set fixed value
    const multisigAddress = '5H7nVfrWNcDdVAwZt1FJd7joBehjMbuT5j9AFtp2ixDH1wsv'; //TODO: replace with actual value

    // 4. Send 1 WND to Charlie account
    try {
      const info = await this.api.query.multisig.multisigs(multisigAddress, hexToU8a('0xdf10f1b47ae4e1f0e93b57f4e35c1d453caca1d06c905dc8d2824a389cc9b099')); //TODO: took from transaction.method.hash
      const timePoint = info.unwrap().when;

      const txHash = await this.api.tx.multisig
        .asMulti(threshold, otherSignatories.sort(), timePoint, '0x040000245233f6f31cdf26937e58dc67009d28599d203b2f46173fe9eec86235f23e4413000064a7b3b6e00d', false, weight) //TODO: took from transaction.method.toHex()
        .signAndSend(account.pair);

      console.clear();
      console.log("DONE AND SEND!!!");

    } catch (error) {
      console.clear();
      console.error(error);
    }
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

  subscribeToTransfers(address: string): void {
    this.activeAddresses.add(address);

    if (this.activeAddresses.size > 1) {
      return;
    }

    try {
      this.api.rpc.chain.subscribeFinalizedHeads(
        async (header: any) => {
          const [{ block }, records] = await Promise.all([
            this.api.rpc.chain.getBlock(header.hash),
            this.api.query.system.events.at(header.hash)
          ]);

          block.extrinsics.forEach((extrinsic: any, index: any) => {
            // Retrieve all events for this extrinsic
            const events = records.filter(
              ({ phase }: any) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index)
            );

            // Search if it is a transfer
            events.forEach(({ event }: any) => {
              const [sender, recipient, amount] = event.data;

              const isDeposit = recipient && this.activeAddresses.has(recipient.toString());
              const isWithdraw = sender && this.activeAddresses.has(sender.toString());

              const relatedTransfer = isDeposit || isWithdraw;
              
              if (event.method === 'Transfer' && relatedTransfer) {
                const relatedAddress = isDeposit ? recipient.toString() : sender.toString();

                emitter.emit(`wallet:transfer:${relatedAddress}`, {
                  hash: extrinsic.hash.toString(),
                  from: sender.toString(),
                  date: new Date().getTime(),
                  amount: ApiService.formatCurrency(amount, !isDeposit)
                });
              }
            });
          });
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  unsubscribeFromTransfers(address: string): void {
    this.activeAddresses.delete(address);
  }

  static readonly getInstance = singleton(() => new ApiService());

}
