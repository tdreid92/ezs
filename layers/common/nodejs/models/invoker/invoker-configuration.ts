import { Lambda } from 'aws-sdk';

export interface InvokerConfiguration {
  functionName: string;
  InvocationType?: InvocationType; //todo remove enum
  logType?: LogType; //todo remove enum
  qualifier?: Lambda.Qualifier;
  functionEndpoint?: string;
}

export const enum FunctionNamespace {
  GetTranslationController = 'GetTranslationController',
  UploadTranslationController = 'UploadTranslationController',
  RepositoryHandler = 'RepositoryHandler',
  SpeechSynthesizer = 'SpeechSynthesizer'
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
