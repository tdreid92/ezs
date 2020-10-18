export const enum FunctionNamespace {
  CRYPTOCURRENCY_RATE_CONTROLLER = 'CryptocurrencyRateController',
  FIND_CRYPTOCURRENCY_RATE = 'FindCryptocurrencyRate'
}

export const enum InvocationType {
  RequestResponse = 'RequestResponse',
  EVENT = 'Event',
  DRYRUN = 'DryRun'
}

export enum LogType {
  NONE = 'None',
  TAIL = 'Tail'
}

export type RateRequestType = 'GET' | 'UPLOAD' | 'DELETE';

export interface RateRequest {
  type: RateRequestType;
  ratePair: ExchangeRatePair;
}

export interface ExchangeRatePair {
  baseCurr: string;
  date: string;
  quoteCurr: string;
  rate?: number;
}

export const DynamoDbTables = Object.freeze({
  PROD: 1,
  TEST: 2,
  DEV: 3,
  null: 3,
  properties: Object.freeze({
    1: Object.freeze({
      TRANSLATIONS: 'Translations_Prod',
      DEFINITIONS: 'Definitions_Prod',
      USERS: 'Users_Prod',
      TAGS: 'Tags_Prod',
      FLASHCARDS: 'Flashcards_Prod'
    }),
    2: Object.freeze({
      TRANSLATIONS: 'Translations_Test',
      DEFINITIONS: 'Definitions_Test',
      USERS: 'Users_Test',
      TAGS: 'Tags_Test',
      FLASHCARDS: 'Flashcards_Test'
    }),
    3: Object.freeze({
      TRANSLATIONS: 'Translations_Dev',
      DEFINITIONS: 'Definitions_Dev',
      USERS: 'Users_Dev',
      TAGS: 'Tags_Dev',
      FLASHCARDS: 'Flashcards_Dev'
    })
  })
});
