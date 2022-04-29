import BigNumber from 'bignumber.js';
import Keyring from '@polkadot/ui-keyring';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto';

import type { IAccount, IVestingPlan, ITransaction } from '../../types';
import type { CreateResult } from '@polkadot/ui-keyring/types';
import type { WordCount } from '@polkadot/util-crypto/mnemonic/generate';

import { singleton } from '@/utils/singleton';
import { emitter } from '@/utils/eventBus';

export class ApiService {

  private env = {
    development: {
      network: 'wss://gateway.testnet.octopus.network/deip/46v4p8ss613olf92p2scmsjud68mhzrr',
      subscan: 'https://polkadot.api.subscan.io/api/scan/transfers'
    },
    production: {
      network: 'wss://gateway.mainnet.octopus.network/deip/b9e1ipeh3ejw2znrb4s2xd4tlf6gynq0',
      subscan: 'WIP'
    }
  };

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

  private static formatCurrency(currency: number): string {
    return new BigNumber(currency)
      .shiftedBy(-18)
      .toFormat(BigNumber.ROUND_FLOOR);
  }

  async loadApi(): Promise<void> {
    try {
      const provider = new WsProvider(this.env.development.network);
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
        isDevelopment: true
      });
    } catch (error) {
      console.error('Unable to load Keyring. ', error);
    }
  }

  async init(): Promise<void> {
    await this.loadApi();
    this.loadKeyring();
  }

  // ////////////////////////

  generateSeedPhrase(numWords: WordCount | undefined = 12): string {
    return mnemonicGenerate(numWords);
  }

  validateSeedPhrase(seedPhrase: string): boolean {
    return mnemonicValidate(seedPhrase);
  }

  getOrCreateAccountWithSeedPhrase(seedPhrase: string): CreateResult {
    if (this.validateSeedPhrase(seedPhrase)) {
      console.log(Keyring.addUri(seedPhrase));
      return Keyring.addUri(seedPhrase);
    }

    throw new Error(`The seed phrase "${seedPhrase}" is not valid`);
  }

  // ////////////////////////

  async getVestingPlan(address: string): Promise<IVestingPlan | undefined> {
    try {
      const { value } = await this.api.query.deipVesting.vestingPlans(address);

      return {

        // Duration of cliff, not allowed to withdraw
        cliffDuration: Number(value.cliffDuration),

        // Amount of tokens which will be released at startTime
        initialAmount: ApiService.formatCurrency(value.initialAmount),

        // Vesting interval (availability for the next unlock)
        interval: Number(value.interval),

        // Starting time for unlocking (vesting)
        startTime: Number(value.startTime),

        // Total locked amount, including the initialAmount
        totalAmount: ApiService.formatCurrency(value.totalAmount),

        // Total duration of this vesting plan (in time)
        totalDuration: Number(value.totalDuration),

        // True if vesting amount is accumulated during cliff duration
        vestingDuringCliff: Boolean(value.vestingDuringCliff)

      };
    } catch (error) {
      console.log(error);
    }
  }

  async getAccountBalance(address: string): Promise<IAccount | undefined> {
    try {
      const res = await this.api.query.system.account(address);

      return {

        // The number of transactions this account has sent.
        nonce: res.nonce.toNumber(),

        // The number of other modules that currently depend on this account's existence. The account
        // cannot be reaped until this is zero.
        consumers: res.consumers.toNumber(),

        // The number of other modules that allow this account to exist. The account may not be reaped
        // until this and `sufficients` are both zero.
        providers: res.providers.toNumber(),

        // The number of modules that allow this account to exist for their own purposes only. The
        // account may not be reaped until this and `providers` are both zero.
        sufficients: res.sufficients.toNumber(),

        // The additional data that belongs to this account. Used to store the balance(s) in a lot of
        // chains.
        data: {

          // Non-reserved part of the balance. There may still be restrictions on this, but it is the
          // total pool what may in principle be transferred, reserved and used for tipping.
          //
          // This is the only balance that matters in terms of most operations on tokens. It
          // alone is used to determine the balance when in the contract execution environment.
          free: ApiService.formatCurrency(res.data.free),

          // Balance which is reserved and may not be used at all.
          //
          // This can still get slashed, but gets slashed last of all.
          //
          // This balance is a 'reserve' balance that other subsystems use in order to set aside tokens
          // that are still 'owned' by the account holder, but which are suspendable.
          reserved: ApiService.formatCurrency(res.data.reserved),

          // The amount that `free` may not drop below when withdrawing for *anything except transaction
          // fee payment*.
          miscFrozen: ApiService.formatCurrency(res.data.miscFrozen),

          // The amount that `free` may not drop below when withdrawing specifically for transaction
          // fee payment.
          feeFrozen: ApiService.formatCurrency(res.data.feeFrozen)

        }

      };
    } catch (error) {
      console.log(error);
    }
  }

  async getTransactions(address: string): Promise<any> {
    try {
      const res = await fetch(this.env.development.subscan, {
        method: 'POST',
        headers: {
          'X-API-Key': 'add1eafb458177af01a7f2ea9baff12a',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ row: 10, page: 1, address })
      });

      return res.json();
    } catch (error) {
      console.log(error);
    }
  }

  async getTransactionFee(
    recipient: string,
    address: string,
    amount: number
  ): Promise<string | undefined> {
    try {
      const { partialFee } = await this.api.tx.balances
        .transfer(recipient, amount)
        .paymentInfo(address);

      return ApiService.formatCurrency(partialFee);
    } catch (error) {
      console.log(error);
    }
  }

  async makeTransaction(
    recipient: string,
    account: CreateResult,
    amount: number
  ): Promise<ITransaction | undefined> {
    console.log(
      recipient,
      account.pair,
      amount
    );

    try {
      const hash = await this.api.tx.balances
        .transfer(recipient, new BigNumber(amount).shiftedBy(18).toString())
        .signAndSend(account.pair);

      return {
        hash: hash.toHex(),
        to: recipient,
        date: new Date(),
        amount
      };
    } catch (error) {
      console.log(error);
    }
  }

  subscribeToTransfers(address: string): void {
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

              if (event.method === 'Transfer' && recipient && recipient.toString() === address) {
                emitter.emit('transaction', {
                  hash: extrinsic.hash.toString(),
                  from: sender.toString(),
                  date: new Date(),
                  amount: ApiService.formatCurrency(amount)
                });
              }
            });
          });
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  static readonly getInstance = singleton(() => new ApiService());

}
