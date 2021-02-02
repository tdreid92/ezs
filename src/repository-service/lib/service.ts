import { repository } from './repository';
import { PayloadRequest, PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { DynamoDB } from 'aws-sdk';
import { GetTranslationRequest } from '../../../layers/common/nodejs/models/get-translation-request';
import { dbUtils } from './db-utils';
import createError from 'http-errors';
import { match, Predicate } from '../../../layers/common/nodejs/types/match';
import {
  DatabaseGetRequest,
  DatabasePutRequest,
  DatabaseRequest,
  DatabaseResponse,
  DatabaseUpdateRequest,
  Query
} from '../../../layers/common/nodejs/models/database-request';
import { UploadTranslationRequest } from '../../../layers/common/nodejs/models/upload-translation-request';
import { UpdateTranslationRequest } from '../../../layers/common/nodejs/models/update-translation-request';
import { GetTranslationResponse } from '../../../layers/common/nodejs/models/get-translation-response';
import { BulkUploadTranslationResponse } from '../../../layers/common/nodejs/models/bulk-upload-translation-response';

const isGet: Predicate<Query> = (q: Query) => q == Query.Get;
const isScan: Predicate<Query> = (q: Query) => q == Query.Scan;
const isBatchWrite: Predicate<Query> = (q: Query) => q == Query.BatchWrite;
const isUpdate: Predicate<Query> = (q: Query) => q == Query.Update;

const handleCrudEvent = async (event: PayloadRequest<DatabaseRequest>): Promise<PayloadResponse<DatabaseResponse>> => {
  if (dbUtils.isTableUndefined()) {
    throw new createError.ServiceUnavailable('Database is unavailable');
  }

  const databaseRequest: DatabaseRequest = event.payload;

  return await match(databaseRequest.query)
    .on(isGet, async () => get((databaseRequest as DatabaseGetRequest).getRequest))
    .on(isScan, async () => scan())
    .on(isUpdate, async () => update((databaseRequest as DatabaseUpdateRequest).updateRequest))
    .on(isBatchWrite, async () => batchWrite((databaseRequest as DatabasePutRequest).uploadRequests))
    .otherwise(() => {
      throw new createError.BadRequest('Query type [' + databaseRequest.query + '] not permitted');
    });
};

const get = async (getRequest: GetTranslationRequest): Promise<PayloadResponse<GetTranslationResponse>> => {
  if (!getRequest) {
    throw new createError.BadRequest('GetTranslationRequest is undefined or null');
  }
  const input: DynamoDB.GetItemInput = dbUtils.buildGetItemParams(getRequest);
  return repository.get(input);
};

const scan = async (): Promise<PayloadResponse<GetTranslationResponse[]>> => {
  const input: DynamoDB.ScanInput = dbUtils.buildListItemsParams();
  return repository.scan(input);
};

const update = async (updateRequest: UpdateTranslationRequest): Promise<PayloadResponse<any>> => {
  if (!updateRequest) {
    throw new createError.BadRequest('UpdateTranslationRequest is undefined or null');
  }
  const input: DynamoDB.UpdateItemInput = dbUtils.buildUpdateParams(updateRequest);
  return repository.update(input);
};

const batchWrite = async (
  uploadRequests: UploadTranslationRequest[]
): Promise<PayloadResponse<BulkUploadTranslationResponse>> => {
  if (!uploadRequests) {
    throw new createError.BadRequest('UploadTranslationRequest is undefined or null');
  }
  const input: DynamoDB.BatchWriteItemInput = dbUtils.buildBatchWriteParams(uploadRequests);
  return repository.batchWrite(input);
};

export const service = {
  handle: handleCrudEvent
};
