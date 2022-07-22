import type { CreateResult } from '@polkadot/ui-keyring/types';

export interface IAccount {
  nonce: number;
  consumers: number;
  providers: number;
  sufficients: number;
  data: {
    free: string;
    reserved: string;
    feeFrozen: string;
    miscFrozen: string;
    actual: string;
  }
}

export interface IVestingPlan {
  cliffDuration: number;
  initialAmount: string;
  interval: number;
  intervalsCount: number;
  startTime: number;
  endTime: number;
  totalAmount: string;
  totalDuration: number;
  vestingDuringCliff: boolean;
}

export interface ITransaction {
  hash: string;
  to?: string;
  from?: string;
  date: Date | number;
  amount: number | string;
}

export interface ITransactionHistoryItem {
  _id: string;
  data: {
    from: string;
    to: string;
    amount: number;
  },
  upcoming: boolean;
  createdOn: string;
}

export interface IKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface IPortal {
  portalId: string;
  url: string;
  name: string;
}

export interface IWallet extends IKeyPair {
  address: string | undefined;
  portal: IPortal;
}

export interface ISignatory {
  address: string;
  name: string;
  isApproved?: boolean;
}

export interface IMultisigWallet {
  address: string;
  name: string;
  threshold: number,
  signatories: ISignatory[];
}

export interface IMultisigTransactionData {
  callData: string;
  callHash: string;
}

export interface IMultisigTransaction {
  callHash: string;
  callData?: string;
  recipient: string;
  amount: number;
  account: CreateResult,
  multisigAddress?: string,
  otherSignatories: string[],
  threshold: number,
}

export interface IMultisigTransactionItem extends IMultisigTransactionData {
  _id: string;
  type: string;
  address: string;
  recipient: string;
  amount: number;
  initiator: string;
  threshold: number;
  approvals: number;
  status: string;
  signatories: ISignatory[];
}

export interface IMultisigVestingItem extends IMultisigTransactionData {
  _id: string;
  type: string;
  address: string;
  initiator: string;
  threshold: number;
  approvals: number;
  status: string;
  signatories: ISignatory[];
}

export type ApprovalType = 'transfer' | 'vesting';
