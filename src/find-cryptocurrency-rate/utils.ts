import { CurrencyPair } from '../../layers/common/nodejs/utils/common-constants';

const buildKey = (currPair: CurrencyPair): string => {
  const sep = '.';
  return currPair.baseCurr + sep + currPair.date + sep + currPair.quoteCurr;
};

export const utils = {
  buildKey: buildKey
};
