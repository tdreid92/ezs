import { DynamoDB } from 'aws-sdk';
import { config } from './config';
import { commonUtils } from '../../../layers/common/nodejs/utils/common-utils';
import { Definition, TranslationRequest } from '../../../layers/common/nodejs/models/translation';

const isTableUndefined = (): boolean => config.tableName == '';

const buildGetItemParams = (req: TranslationRequest): DynamoDB.GetItemInput =>
  <DynamoDB.GetItemInput>{
    TableName: config.tableName,
    Key: {
      translationKey: commonUtils.buildTableKey(req.source, req.target, req.word)
    }
  };

const buildListItemsParams = (): DynamoDB.ScanInput => ({
  TableName: config.tableName
});

const buildPutRequests = (req: Definition[]): DynamoDB.BatchWriteItemRequestMap =>
  <DynamoDB.BatchWriteItemRequestMap>(<unknown>req.map((def: Definition) => ({
    PutRequest: {
      Item: {
        translationKey: commonUtils.buildTableKey(def.source, def.target, def.word),
        target: def.target,
        source: def.source,
        word: def.word,
        content: def.content,
        href: config.s3bucketName + '/' + def.source + def.target + def.word,
        createdAt: Date.now()
      }
    }
  })));

const buildBatchWriteParams = (req: Definition[]): DynamoDB.BatchWriteItemInput => <DynamoDB.BatchWriteItemInput>(<
    unknown
  >{
    RequestItems: {
      [config.tableName]: buildPutRequests(req)
    }
  });

export const dbUtils = {
  isTableUndefined: isTableUndefined,
  buildGetItemParams: buildGetItemParams,
  buildListItemsParams: buildListItemsParams,
  buildBatchWriteParams: buildBatchWriteParams
};
