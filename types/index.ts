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
  }
}

export interface IVestingPlan {
  cliffDuration: number;
  initialAmount: string;
  interval: number;
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
  date: Date;
  amount: number | string;
}
