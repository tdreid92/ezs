import { repository } from './repository';
import { PayloadRequest, PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { DynamoDB } from 'aws-sdk';
import { dbUtils } from './db-utils';
import createError from 'http-errors';
import {
  DatabaseGetRequest,
  DatabasePutRequest,
  DatabaseRequest,
  Query
} from '../../../layers/common/nodejs/models/database-request';
import { match, Predicate } from '../../../layers/common/nodejs/utils/match';
import { EventResponse } from '../../../layers/common/nodejs/log/event-logger';
import { Definition, TranslationRequest, TranslationResponse } from '../../../layers/common/nodejs/models/translation';

const isGet: Predicate<Query> = (q: Query) => q == Query.Get;
const isList: Predicate<Query> = (q: Query) => q == Query.List;
const isWrite: Predicate<Query> = (q: Query) => q == Query.Write;

const handleCrudEvent = async (event: PayloadRequest<DatabaseRequest>): Promise<EventResponse> => {
  if (dbUtils.isTableUndefined()) {
    throw new createError.ServiceUnavailable('Database is unavailable');
  }

  const databaseRequest: DatabaseRequest = event.payload;

  return await match(databaseRequest.query)
    .on(isGet, async () => get((databaseRequest as DatabaseGetRequest).getRequest))
    .on(isList, async () => scan())
    .on(isWrite, async () => write((databaseRequest as DatabasePutRequest).putRequest))
    .otherwise(() => {
      throw new createError.BadRequest('Query type [' + databaseRequest.query + '] not permitted');
    });
};

const get = async (req: TranslationRequest): Promise<PayloadResponse<TranslationResponse>> => {
  if (!req) {
    throw new createError.BadRequest('Get Item is undefined or null');
  }
  const input: DynamoDB.GetItemInput = dbUtils.buildGetItemParams(req);
  return repository.get(input);
};

const scan = async (): Promise<PayloadResponse<TranslationResponse[]>> => {
  const input: DynamoDB.ScanInput = dbUtils.buildListItemsParams();
  return repository.scan(input);
};

const write = async (req: Definition[]): Promise<PayloadResponse<any>> => {
  if (!req) {
    throw new createError.BadRequest('Upload Items are undefined or null');
  }
  const input: DynamoDB.BatchWriteItemInput = dbUtils.buildBatchWriteParams(req);
  return repository.batchWrite(input);
};

export const service = {
  handle: handleCrudEvent
};
