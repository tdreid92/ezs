import {
  HttpStatus,
  PayloadResponse,
  Query,
  RateRequest
} from '../../layers/common/nodejs/utils/common-constants';
import { reduce } from 'conditional-reduce';
import { db } from './dynamoDb';
import { log } from '../../layers/common/nodejs/utils/lambda-logger';

const defaultCaseDbResult: Promise<PayloadResponse> = Promise.resolve({
  statusCode: HttpStatus.NotImplemented,
  body: ''
});

const getDefaultCaseDbResult = async (): Promise<PayloadResponse> => {
  log.error('Default case');
  return defaultCaseDbResult;
  // createError;
};

const findExchangeRate = async (event: RateRequest): Promise<PayloadResponse> =>
  event.query
    ? await reduce<Promise<PayloadResponse>>(
        event.query,
        {
          [Query.Get]: async () => db.get(event.getRateRequest),
          [Query.List]: async () => db.list(),
          [Query.Put]: async () => db.put(event.putRatesRequest)
        },
        () => getDefaultCaseDbResult()
      )
    : defaultCaseDbResult;

export const exchangeRateCrudService = {
  findExchangeRate: findExchangeRate
};
