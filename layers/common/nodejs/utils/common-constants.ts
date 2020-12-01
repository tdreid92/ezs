import { DynamoDB } from 'aws-sdk';

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

export type Next = () => void | Promise<void>;

export interface DbPayload {
  statusCode: number;
  body: any;
}

export type DynamoDbInput =
  | DynamoDB.GetItemInput
  | DynamoDB.ScanInput
  | DynamoDB.BatchWriteItemInput
  | DynamoDB.PutItemInput
  | DynamoDB.BatchGetItemInput;

export interface RateRequest {
  requestType: DbRequestType;
  getRateRequest: CurrencyPair | undefined;
  putRatesRequest: ExchangeRatePair[] | undefined;
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
  statusCode: HttpStatus;
  statusMessage: string;
}

//TODO: implement response object
export interface ExchangeRateResponse {
  exchangeRates: ExchangeRatePair | ExchangeRatePair[] | ExchangeRateError;
}

export enum HttpStatus {
  success = 200,
  noContent = 204,
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  methodNotAllowed = 405,
  payloadTooLarge = 413,
  unprocessableEntity = 422,
  internalServerError = 500,
  notImplemented = 501,
  serviceUnavailable = 503
}
