import { CurrencyPair, ExchangeRatePair } from '../../layers/common/nodejs/utils/common-constants';
import { DynamoDB } from 'aws-sdk';

const tableName: string =
  process.env.DYNAMODB_TABLE != undefined ? process.env.DYNAMODB_TABLE : 'test';

const buildKey = (currPair: CurrencyPair): string => {
  const sep = '.';
  return currPair.baseCurr + sep + currPair.date + sep + currPair.quoteCurr;
};

const buildGetItemParams = (currPair: CurrencyPair): DynamoDB.GetItemInput =>
  <DynamoDB.GetItemInput>{
    TableName: tableName,
    Key: {
      ExchangeRateKey: buildKey(currPair)
    }
  };

const buildListItemsParams = (): DynamoDB.DocumentClient.ScanInput => {
  return {
    TableName: tableName
  };
};

const buildPutRequests = (ratePairs: ExchangeRatePair[]) =>
  ratePairs.map((rp: ExchangeRatePair) => ({
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
  }));

const buildBatchWriteParams = (ratePairs: ExchangeRatePair[]): DynamoDB.BatchWriteItemOutput => {
  return <DynamoDB.BatchWriteItemOutput>{
    RequestItems: {
      [tableName]: buildPutRequests(ratePairs)
    }
  };
};

export const dbUtils = {
  buildGetItemParams: buildGetItemParams,
  buildListItemsParams: buildListItemsParams,
  buildBatchWriteParams: buildBatchWriteParams
};
