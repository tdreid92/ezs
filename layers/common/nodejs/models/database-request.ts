import { DynamoDB } from 'aws-sdk';
import { Definition, TranslationRequest } from './translation';

export type DatabaseRequest = DatabaseGetRequest | DatabaseListRequest | DatabasePutRequest;

interface DatabaseQuery {
  query: Query;
}

export interface DatabaseGetRequest extends DatabaseQuery {
  getRequest: TranslationRequest;
}

export interface DatabasePutRequest extends DatabaseQuery {
  putRequest: Definition[];
}

export type DatabaseListRequest = DatabaseQuery;

export type DatabaseResponse = DynamoDB.GetItemOutput | DynamoDB.BatchWriteItemOutput | DynamoDB.UpdateItemOutput;

export const enum Query {
  Get = 'Get',
  List = 'List',
  Write = 'Write',
  Update = 'Update'
}
