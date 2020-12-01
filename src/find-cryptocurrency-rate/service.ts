import {
  DbPayload,
  DbRequestType,
  RateRequest,
  HttpStatus
} from '../../layers/common/nodejs/utils/common-constants';
import { reduce } from 'conditional-reduce';
import { db } from './dynamoDb';
import { log } from '../../layers/common/nodejs/utils/lambda-logger';

const defaultCaseDbResult: Promise<DbPayload> = Promise.resolve({
  statusCode: HttpStatus.notImplemented,
  body: ''
});

const getDefaultCaseDbResult = async (): Promise<DbPayload> => {
  log.error('Default case');
  return defaultCaseDbResult;
  // createError;
};

const findExchangeRate = async (event: RateRequest): Promise<DbPayload> =>
  event.requestType
    ? await reduce<Promise<DbPayload>>(
        event.requestType,
        {
          [DbRequestType.GET]: async () => db.get(event.getRateRequest),
          [DbRequestType.LIST]: async () => db.list(),
          [DbRequestType.PUT]: async () => db.put(event.putRatesRequest)
        },
        () => getDefaultCaseDbResult()
      )
    : defaultCaseDbResult;

export const service = {
  findExchangeRate: findExchangeRate
};
