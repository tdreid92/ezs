import { GetTranslationRequest } from './get-translation-request';
import { UploadTranslationRequest } from './upload-translation-request';
import { UpdateTranslationRequest } from './update-translation-request';
import { DynamoDB } from 'aws-sdk';

export type DatabaseRequest = DatabaseGetRequest | DatabaseListRequest | DatabaseUpdateRequest | DatabasePutRequest;

interface DatabaseQuery {
  query: Query;
}

export interface DatabaseGetRequest extends DatabaseQuery {
  getRequest: GetTranslationRequest;
}

export interface DatabaseUpdateRequest extends DatabaseQuery {
  updateRequest: UpdateTranslationRequest;
}

export interface DatabasePutRequest extends DatabaseQuery {
  uploadRequests: UploadTranslationRequest[];
}

export type DatabaseListRequest = DatabaseQuery;

export type DatabaseResponse = DynamoDB.GetItemOutput | DynamoDB.BatchWriteItemOutput | DynamoDB.UpdateItemOutput;

export const enum Query {
  Get = 'Get',
  Scan = 'Scan',
  BatchWrite = 'BatchWrite',
  Update = 'Update'
}
