import { GetTranslationRequest } from './get-translation-request';
import { UploadTranslationRequest } from './upload-translation-request';
import { UpdateTranslationRequest } from './update-translation-request';
import { DynamoDB } from 'aws-sdk';

export interface DatabaseRequest {
  query: Query;
  getRequest?: GetTranslationRequest;
  uploadRequests?: UploadTranslationRequest[];
  updateRequest?: UpdateTranslationRequest;
}

export type DatabaseResponse = DynamoDB.GetItemOutput | DynamoDB.BatchWriteItemOutput | DynamoDB.UpdateItemOutput;

export const enum Query {
  Get = 'Get',
  Scan = 'Scan',
  BatchWrite = 'BatchWrite',
  Update = 'Update'
}
