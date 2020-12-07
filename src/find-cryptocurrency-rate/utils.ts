import { CurrencyPair, ExchangeRatePair } from '../../layers/common/nodejs/utils/common-constants';
import { DynamoDB } from 'aws-sdk';
import { config } from './models/config';

const buildKey = (currPair: CurrencyPair): string => {
  const sep = '.';
  return currPair.baseCurr + sep + currPair.date + sep + currPair.quoteCurr;
};

const buildGetItemParams = (currPair: CurrencyPair): DynamoDB.GetItemInput =>
  <DynamoDB.GetItemInput>{
    TableName: config.tableName,
    Key: {
      ExchangeRateKey: buildKey(currPair)
    }
  };

const buildListItemsParams = (): DynamoDB.DocumentClient.ScanInput => {
  return {
    TableName: config.tableName
  };
};

const buildPutRequests = (ratePairs: ExchangeRatePair[]): DynamoDB.BatchWriteItemRequestMap =>
  <DynamoDB.BatchWriteItemRequestMap>(<unknown>ratePairs.map((rp: ExchangeRatePair) => ({
    PutRequest: {
      Item: {
        ExchangeRateKey: buildKey(rp),
        BaseCurrency: rp.baseCurr,
        Date: rp.date,
        QuoteCurrency: rp.quoteCurr,
        Rate: rp.rate,
        CreatedAt: Date.now()
      }
    }
  })));

const buildBatchWriteParams = (ratePairs: ExchangeRatePair[]): DynamoDB.BatchWriteItemInput => {
  return <DynamoDB.BatchWriteItemInput>(<unknown>{
    RequestItems: {
      [config.tableName]: buildPutRequests(ratePairs)
    }
    //ReturnItemCollectionMetrics: 'SIZE'
  });
};

export const dbUtils = {
  buildGetItemParams: buildGetItemParams,
  buildListItemsParams: buildListItemsParams,
  buildBatchWriteParams: buildBatchWriteParams
};
