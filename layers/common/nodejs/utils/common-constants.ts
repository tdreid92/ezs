export const enum FunctionNamespace {
  CRYPTOCURRENCY_RATE_CONTROLLER = 'CryptocurrencyRateController',
  FIND_CRYPTOCURRENCY_RATE = 'FindCryptocurrencyRate'
}

export const enum InvocationType {
  RequestResponse = 'RequestResponse',
  EVENT = 'Event',
  DRYRUN = 'DryRun'
}

export const enum LogType {
  NONE = 'None',
  TAIL = 'Tail'
}

export const enum DbRequestType {
  GET = 'GET',
  PUT = 'PUT',
  LIST = 'LIST'
}

export interface DbPayload {
  statusCode: number;
  payload: any;
}

export interface RateRequest {
  requestType: DbRequestType;
  getRateRequest: CurrencyPair;
  putRatesRequest: ExchangeRatePair[];
}

export interface CurrencyPair {
  baseCurr: string;
  date: string;
  quoteCurr: string;
}

export interface ExchangeRatePair {
  baseCurr: string;
  date: string;
  quoteCurr: string;
  rate: number;
}

export interface ExchangeRateError {
  statusCode: StatusCode;
  statusMessage: string;
}

//TODO: implement response object
export interface ExchangeRateResponse {
  exchangeRates: ExchangeRatePair | ExchangeRatePair[] | ExchangeRateError;
}

export enum StatusCode {
  success = 200,
  noContent = 204,
  badRequest = 400,
  internalServerError = 500,
  notImplemented = 501
}
