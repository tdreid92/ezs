import { Lambda } from 'aws-sdk';

export interface InvokerOptions {
  functionName: FunctionNamespace;
  InvocationType?: InvocationType; //todo remove enum
  logType?: LogType; //todo remove enum
  qualifier?: Lambda.Qualifier;
}

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
