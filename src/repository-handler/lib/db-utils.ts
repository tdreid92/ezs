import { DynamoDB } from 'aws-sdk';
import { config } from './config';
import { commonUtils } from '../../../layers/common/nodejs/utils/common-utils';
import { GetTranslationRequest } from '../../../layers/common/nodejs/models/get-translation-request';
import { UploadTranslationRequest } from '../../../layers/common/nodejs/models/upload-translation-request';
import { UpdateTranslationRequest } from '../../../layers/common/nodejs/models/update-translation-request';

const isTableUndefined = (): boolean => config.tableName == '';

const buildGetItemParam = (getRequest: GetTranslationRequest): DynamoDB.GetItemInput =>
  <DynamoDB.GetItemInput>{
    TableName: config.tableName,
    Key: {
      translationKey: commonUtils.buildTableKey(getRequest.source, getRequest.target, getRequest.word)
    }
  };

const buildListItemsParam = (): DynamoDB.ScanInput => {
  return {
    TableName: config.tableName
  };
};

const buildUpdateParam = (updateRequest: UpdateTranslationRequest): DynamoDB.UpdateItemInput =>
  <DynamoDB.UpdateItemInput>{
    TableName: config.tableName,
    Key: {
      translationKey: updateRequest.translationKey
    }
    // UpdateExpression: "set s3Url = :s3Ur"
  };

const buildPutRequests = (uploadRequests: UploadTranslationRequest[]): DynamoDB.BatchWriteItemRequestMap =>
  <DynamoDB.BatchWriteItemRequestMap>(<unknown>uploadRequests.map((req: UploadTranslationRequest) => ({
    PutRequest: {
      Item: {
        translationKey: commonUtils.buildTableKey(req.source, req.target, req.word),
        target: req.target,
        source: req.source,
        word: req.word,
        definition: req.definition,
        createdAt: Date.now()
      }
    }
  })));

const buildBatchWriteParam = (uploadRequests: UploadTranslationRequest[]): DynamoDB.BatchWriteItemInput => {
  return <DynamoDB.BatchWriteItemInput>(<unknown>{
    RequestItems: {
      [config.tableName]: buildPutRequests(uploadRequests)
    }
  });
};

export const dbUtils = {
  isTableUndefined: isTableUndefined,
  buildGetItemParam: buildGetItemParam,
  buildListItemsParam: buildListItemsParam,
  buildUpdateParam: buildUpdateParam,
  buildBatchWriteParam: buildBatchWriteParam
};
