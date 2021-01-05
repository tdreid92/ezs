import { reduce } from 'conditional-reduce';
import { repository } from './rate-repository';
import { Query, RateRequest } from '../../../layers/common/nodejs/models/rate-request';
import { ResponseEntity } from '../../../layers/common/nodejs/models/invoker/payload';
import { DynamoDB } from 'aws-sdk';
import { CurrencyPair } from '../../../layers/common/nodejs/models/currency-pair';
import { dbUtils } from './db-utils';
import createError from 'http-errors';
import { ExchangeRatePair } from '../../../layers/common/nodejs/models/exchange-rate-pair';

type Predicate<T> = (x: T) => boolean;
type Transformation<T> = (x: T) => any;
type MatchContext<T> = {
  on: (predicate?: Predicate<T>, fn?: Transformation<T>) => MatchContext<T | any>;
  otherwise: (fn: Transformation<T>) => any;
};

function matched<T>(value: T): MatchContext<T> {
  return {
    on: () => matched(value),
    otherwise: () => value
  };
}

function match<T>(value: T): MatchContext<T> {
  return {
    on: (predicate: Predicate<any> | undefined, fn: Transformation<any> | undefined) =>
      !predicate || predicate(value) ? matched(fn ? fn(value) : undefined) : match(value),
    otherwise: (fn) => fn(value)
  };
}

const handleCrudEvent = async (event: RateRequest): Promise<ResponseEntity> => {
  if (dbUtils.isTableUndefined()) {
    throw new createError.ServiceUnavailable('Database is unavailable');
  }
  return await match(event.query)
    .on(
      (q: Query) => q == Query.Get,
      async () => get(event.getRateRequest)
    )
    .on(
      (q: Query) => q == Query.Scan,
      async () => scan()
    )
    .on(
      (q: Query) => q == Query.BatchWrite,
      async () => batchWrite(event.putRatesRequest)
    )
    .otherwise(() => {
      throw new createError.BadRequest('Query type [' + event.query + '] not permitted');
    });
};

const get = async (currPair: CurrencyPair | undefined): Promise<ResponseEntity> => {
  if (!currPair) {
    throw new createError.BadRequest('GetRateRequest is undefined or null');
  }
  const input: DynamoDB.GetItemInput = dbUtils.buildGetItemParams(currPair);
  return repository.get(input);
};

const scan = async (): Promise<ResponseEntity> => {
  const input: DynamoDB.ScanInput = dbUtils.buildListItemsParams();
  return repository.scan(input);
};

const batchWrite = async (ratePairs: ExchangeRatePair[] | undefined): Promise<ResponseEntity> => {
  if (!ratePairs) {
    throw new createError.BadRequest('PutRatesRequest is undefined or null');
  }
  const input: DynamoDB.BatchWriteItemInput = dbUtils.buildBatchWriteParams(ratePairs);
  return repository.batchWrite(input);
};

export const crudRateService = {
  handleCrudEvent: handleCrudEvent
};
