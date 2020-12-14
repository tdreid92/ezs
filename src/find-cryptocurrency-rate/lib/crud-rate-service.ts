import { reduce } from 'conditional-reduce';
import { repository } from './rate-repository';
import { log } from '../../../layers/common/nodejs/log/lambda-logger';
import { Query, RateRequest } from '../../../layers/common/nodejs/models/rate-request';
import { PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { HttpStatus } from '../../../layers/common/nodejs/utils/http-status';
import { DynamoDB } from 'aws-sdk';
import { CurrencyPair } from '../../../layers/common/nodejs/models/currency-pair';
import { dbUtils } from './db-utils';
import { ExchangeRatePair } from '../../../layers/common/nodejs/models/exchange-rate-pair';

const defaultCaseDbResult: Promise<PayloadResponse> = Promise.resolve({
  statusCode: HttpStatus.NotImplemented,
  body: ''
});

const getDefaultCaseDbResult = async (): Promise<PayloadResponse> => {
  log.error('Default case');
  return defaultCaseDbResult;
  // createError;
};

const handleCrudEvent = async (event: RateRequest): Promise<PayloadResponse> =>
  event.query
    ? await reduce<Promise<PayloadResponse>>(
        event.query,
        {
          [Query.Get]: async () => get(event.getRateRequest),
          [Query.Scan]: async () => scan(),
          [Query.BatchWrite]: async () => batchWrite(event.putRatesRequest)
        },
        () => getDefaultCaseDbResult()
      )
    : defaultCaseDbResult;

const get = async (currPair: CurrencyPair | undefined): Promise<PayloadResponse> => {
  if (!currPair) {
    return defaultCaseDbResult;
  }
  const input: DynamoDB.GetItemInput = dbUtils.buildGetItemParams(currPair);
  return repository.get(input);
};

const scan = async (): Promise<PayloadResponse> => {
  const input: DynamoDB.ScanInput = dbUtils.buildListItemsParams();
  return repository.scan(input);
};

const batchWrite = async (ratePairs: ExchangeRatePair[] | undefined): Promise<PayloadResponse> => {
  if (!ratePairs) {
    return defaultCaseDbResult;
  }
  const input: DynamoDB.BatchWriteItemInput = dbUtils.buildBatchWriteParams(ratePairs);
  return repository.batchWrite(input);
};

export const crudRateService = {
  handleCrudEvent: handleCrudEvent
};
