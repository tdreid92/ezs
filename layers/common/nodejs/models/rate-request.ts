import { CurrencyPair } from './currency-pair';
import { ExchangeRatePair } from './exchange-rate-pair';

export interface RateRequest {
  query: Query;
  getRateRequest?: CurrencyPair;
  putRatesRequest?: ExchangeRatePair[];
}

export const enum Query {
  Get = 'Get',
  Scan = 'Scan',
  BatchWrite = 'BatchWrite',
  Barf = 'Barf'
}
