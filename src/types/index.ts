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

export interface IVestingContract {
  cliffDuration: number;
  initialAmount: string;
  interval: number;
  startTime: number;
  totalAmount: string;
  totalDuration: number;
  vestingDuringCliff: boolean;
}
