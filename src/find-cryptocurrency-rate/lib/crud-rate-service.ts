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
  on: (pred?: Predicate<T>, fn?: Transformation<T>) => MatchContext<T | any>;
  otherwise: (fn: Transformation<T>) => any;
};

function matched<T>(x: T): MatchContext<T> {
  return {
    on: () => matched(x),
    otherwise: () => x
  };
}

function match<T>(x: T): MatchContext<T> {
  return {
    on: (pred, fn) => (!pred || pred(x) ? matched(fn ? fn(x) : undefined) : match(x)),
    otherwise: (fn) => fn(x)
  };
}

const handleCrudEvent = async (event: RateRequest): Promise<ResponseEntity> => {
  if (dbUtils.isTableUndefined) {
    throw new createError.ServiceUnavailable('Database unavailable');
  }
  // throw new createError.BadRequest('Query type [' + event.query + '] not permitted');
  try {
    return await reduce<Promise<ResponseEntity>>(event.query, {
      [Query.Get]: async () => get(event.getRateRequest),
      [Query.Scan]: async () => scan(),
      [Query.BatchWrite]: async () => batchWrite(event.putRatesRequest)
    });
  } catch (e) {
    throw new createError.BadRequest('Query type [' + event.query + '] not permitted');
  }
};

const get = async (currPair: CurrencyPair | undefined): Promise<ResponseEntity> => {
  if (!currPair) {
    throw new createError.BadRequest('HUH');
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
    throw new createError.BadRequest('HUH');
  }
  const input: DynamoDB.BatchWriteItemInput = dbUtils.buildBatchWriteParams(ratePairs);
  return repository.batchWrite(input);
};

export const crudRateService = {
  handleCrudEvent: handleCrudEvent
};
