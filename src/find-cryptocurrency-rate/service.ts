import {
  DbPayload,
  DbRequest,
  RateRequest,
  HttpStatus
} from '../../layers/common/nodejs/utils/common-constants';
import { reduce } from 'conditional-reduce';
import { db } from './dynamoDb';
import { log } from '../../layers/common/nodejs/utils/lambda-logger';

const defaultCaseDbResult: Promise<DbPayload> = Promise.resolve({
  statusCode: HttpStatus.NotImplemented,
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
          [DbRequest.Get]: async () => db.get(event.getRateRequest),
          [DbRequest.List]: async () => db.list(),
          [DbRequest.Put]: async () => db.put(event.putRatesRequest)
        },
        () => getDefaultCaseDbResult()
      )
    : defaultCaseDbResult;

export const service = {
  findExchangeRate: findExchangeRate
};
