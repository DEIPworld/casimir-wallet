import BigNumber from 'bignumber.js';

const SHIFT = 18;
const TOKEN = 'DEIP';

export function useNumber() {
  const formatToken = (value: BigNumber.Value | number) => {
    const rawNum = new BigNumber(value).shiftedBy(-SHIFT);
    return `${rawNum.toFormat(BigNumber.ROUND_FLOOR)} ${TOKEN}`;
  };

  const expandToken = (value: number) => {
    new BigNumber(value).shiftedBy(SHIFT).toString();
  };

  return {
    formatToken,
    expandToken
  };
}
