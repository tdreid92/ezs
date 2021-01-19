import { DynamoDB } from 'aws-sdk';
import { config } from './config';
import { commonUtils } from '../../../layers/common/nodejs/utils/common-utils';
import { GetTranslationRequest } from '../../../layers/common/nodejs/models/get-translation-request';
import { UploadTranslationRequest } from '../../../layers/common/nodejs/models/upload-translation-request';

const isTableUndefined = (): boolean => config.tableName == '';

const buildGetItemParams = (getRequest: GetTranslationRequest): DynamoDB.DocumentClient.GetItemInput =>
  <DynamoDB.DocumentClient.GetItemInput>{
    TableName: config.tableName,
    Key: {
      translationKey: commonUtils.buildTableKey(getRequest.source, getRequest.target, getRequest.word)
    }
  };

const buildListItemsParams = (): DynamoDB.DocumentClient.ScanInput => {
  return {
    TableName: config.tableName
  };
};

// const buildPutRequests = (ratePairs: UploadTranslationRequest[]): DynamoDB.DocumentClient.BatchWriteItemRequestMap =>
//   <DynamoDB.DocumentClient.BatchWriteItemRequestMap>(<unknown>ratePairs.map((rp: TranslationUploadRequest) => ({
//     PutRequest: {
//       Item: {
//         translationKey: commonUtils.buildTableKey(rp),
//         BaseCurrency: rp.language,
//         Date: rp.target,
//         QuoteCurrency: rp.source,
//         Rate: rp.definition,
//         CreatedAt: Date.now()
//       }
//     }
//   })));
//
// const buildBatchWriteParams = (ratePairs: TranslationUploadRequest[]): DynamoDB.DocumentClient.BatchWriteItemInput => {
//   return <DynamoDB.DocumentClient.BatchWriteItemInput>(<unknown>{
//     RequestItems: {
//       [config.tableName]: buildPutRequests(ratePairs)
//     }
//     //ReturnItemCollectionMetrics: 'SIZE'
//   });
// };

export const dbUtils = {
  isTableUndefined: isTableUndefined,
  buildGetItemParams: buildGetItemParams,
  buildListItemsParams: buildListItemsParams
  // buildBatchWriteParams: buildBatchWriteParams
};
