import { repository } from './repository';
import { PayloadRequest, PayloadResponse, ResponseEntity } from '../../../layers/common/nodejs/models/invoker/payload';
import { DynamoDB } from 'aws-sdk';
import { GetTranslationRequest } from '../../../layers/common/nodejs/models/get-translation-request';
import { dbUtils } from './db-utils';
import createError from 'http-errors';
import { match, Predicate } from '../../../layers/common/nodejs/types/match';
import { log } from '../../../layers/common/nodejs/log/sam-logger';
import { DatabaseRequest, Query } from '../../../layers/common/nodejs/models/database-request';

const isGet: Predicate<Query> = (q: Query) => q == Query.Get;
const isScan: Predicate<Query> = (q: Query) => q == Query.Scan;
const isUpdate: Predicate<Query> = (q: Query) => q == Query.Update;

const handleCrudEvent = async (event: PayloadRequest): Promise<PayloadResponse> => {
  if (dbUtils.isTableUndefined()) {
    throw new createError.ServiceUnavailable('Database is unavailable');
  }

  const databaseRequest: DatabaseRequest = <DatabaseRequest>event;

  return await match(databaseRequest.query)
    .on(isGet, async () => get(databaseRequest.getRequest))
    .on(isScan, async () => scan())
    // .on(isUpdate, async () => update(databaseRequest.updateRequest))
    .otherwise(() => {
      throw new createError.BadRequest('Query type [' + databaseRequest.query + '] not permitted');
    });
};

const get = async (getRequest: GetTranslationRequest | undefined): Promise<ResponseEntity> => {
  if (!getRequest) {
    throw new createError.BadRequest('GetTranslationRequest is undefined or null');
  }
  const input: DynamoDB.GetItemInput = dbUtils.buildGetItemParams(getRequest);
  log.info(input);
  return repository.get(input);
};

const scan = async (): Promise<ResponseEntity> => {
  const input: DynamoDB.ScanInput = dbUtils.buildListItemsParams();
  return repository.scan(input);
};

// const update = async (uploadRequest: UploadTranslationRequest[] | undefined): Promise<ResponseEntity> => {
//   if (!uploadRequest) {
//     throw new createError.BadRequest('UploadTranslationRequest is undefined or null');
//   }
//   const input: DynamoDB.BatchWriteItemInput = dbUtils.buildBatchWriteParams(uploadRequest);
//   return repository.batchWrite(input);
// };

export const service = {
  handleCrudEvent: handleCrudEvent
};
