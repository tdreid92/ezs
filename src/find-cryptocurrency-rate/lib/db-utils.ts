import { DynamoDB } from 'aws-sdk';
import { config } from './config';
import { ExchangeRatePair } from '../../../layers/common/nodejs/models/exchange-rate-pair';
import { CurrencyPair } from '../../../layers/common/nodejs/models/currency-pair';

const buildKey = (currPair: CurrencyPair): string => {
  const sep = '.';
  return currPair.baseCurr + sep + currPair.date + sep + currPair.quoteCurr;
};

const isTableUndefined = (): boolean => config.tableName == '';

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
  isTableUndefined: isTableUndefined,
  buildGetItemParams: buildGetItemParams,
  buildListItemsParams: buildListItemsParams,
  buildBatchWriteParams: buildBatchWriteParams
};
