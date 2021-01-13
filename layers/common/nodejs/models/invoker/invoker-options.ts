import { Lambda } from 'aws-sdk';

export interface InvokerOptions {
  functionName: string;
  InvocationType?: InvocationType; //todo remove enum
  logType?: LogType; //todo remove enum
  qualifier?: Lambda.Qualifier;
  lambdaEndpoint?: string;
}

export const enum FunctionNamespace {
  ExchangeRateController = 'ExchangeRateController',
  ExchangeRateCrudService = 'FindExchangeRate'
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
