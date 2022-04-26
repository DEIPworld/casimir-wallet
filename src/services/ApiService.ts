import BigNumber from 'bignumber.js';
import { ApiPromise, WsProvider } from '@polkadot/api';

import type { IAccount, IVestingPlan } from '@/types';
import type { ApiTypes } from '@polkadot/api-base/types';
import type { ApiDecoration } from '@polkadot/api/types';

class ApiService {

  private env = {
    development: 'wss://gateway.testnet.octopus.network/deip/46v4p8ss613olf92p2scmsjud68mhzrr',
    production: 'wss://gateway.mainnet.octopus.network/deip/b9e1ipeh3ejw2znrb4s2xd4tlf6gynq0'
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
  // private api: ApiDecoration<ApiTypes> | any = {};
  private api: any;

  private formatCurrency(currency: any): string {
    return new BigNumber(currency).shiftedBy(-21).toFormat();
  }

  async init(): Promise<void> {
    try {
      const provider = new WsProvider(this.env.production);
      this.api = await ApiPromise.create({ provider });
    } catch (error) {
      console.log('Unable to initiate an API service: ', error);
    }
  }

  async getVestingPlan(address: string): Promise<IVestingPlan | undefined> {
    try {
      const { value } = await this.api.query.deipVesting.vestingPlans(address);

      return {

        // Duration of cliff, not allowed to withdraw
        cliffDuration: Number(value.cliffDuration),

        // Amount of tokens which will be released at startTime
        initialAmount: this.formatCurrency(value.initialAmount),

        // Vesting interval (availability for the next unlock)
        interval: Number(value.interval),

        // Starting time for unlocking (vesting)
        startTime: Number(value.startTime),

        // Total locked amount, including the initialAmount
        totalAmount: this.formatCurrency(value.totalAmount),

        // Total duration of this vesting plan (in time)
        totalDuration: Number(value.totalDuration),

        // True if vesting amount is accumulated during cliff duration
        vestingDuringCliff: Boolean(value.vestingDuringCliff)

      };
    } catch (error) {
      console.log(error);
    }
  }

  async getAccount(address: string): Promise<IAccount | undefined> {
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
          free: this.formatCurrency(res.data.free),

          // Balance which is reserved and may not be used at all.
          //
          // This can still get slashed, but gets slashed last of all.
          //
          // This balance is a 'reserve' balance that other subsystems use in order to set aside tokens
          // that are still 'owned' by the account holder, but which are suspendable.
          reserved: this.formatCurrency(res.data.reserved),

          // The amount that `free` may not drop below when withdrawing for *anything except transaction
          // fee payment*.
          miscFrozen: this.formatCurrency(res.data.miscFrozen),

          // The amount that `free` may not drop below when withdrawing specifically for transaction
          // fee payment.
          feeFrozen: this.formatCurrency(res.data.feeFrozen)

        }

      };
    } catch (error) {
      console.log(error);
    }
  }

}

export default new ApiService();
