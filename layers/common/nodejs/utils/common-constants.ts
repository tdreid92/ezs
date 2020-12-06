import { DynamoDB } from 'aws-sdk';

export const enum FunctionNamespace {
  ExchangeRateController = 'CryptocurrencyRateController',
  ExchangeRateCrudService = 'FindCryptocurrencyRate'
}

export const enum InvocationType {
  RequestResponse = 'RequestResponse',
  Event = 'Event',
  Dryrun = 'DryRun'
}

export const enum LogType {
  None = 'None',
  Tail = 'Tail'
}

export const enum Query {
  Get = 'Get',
  Put = 'Put',
  List = 'List'
}

export type NextFunction = () => void | Promise<void>;

export interface PayloadResponse {
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
  query: Query;
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
  Success = 200,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  MethodNotAllowed = 405,
  PayloadTooLarge = 413,
  UnprocessableEntity = 422,
  InternalServerError = 500,
  NotImplemented = 501,
  ServiceUnavailable = 503
}
