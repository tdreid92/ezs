import {
  CurrencyPair,
  DbPayload,
  ExchangeRatePair,
  StatusCode
} from '../../layers/common/nodejs/utils/common-constants';
import { utils } from './utils';
import { BatchWriteItemOutput, GetItemOutput, ScanOutput } from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk/lib/error';
import { dbLogWrapper } from '../../layers/common/nodejs/utils/lambda-logger';
import { DynamoDB } from 'aws-sdk';

const tableName: string =
  process.env.DYNAMODB_TABLE != undefined ? process.env.DYNAMODB_TABLE : 'test';
const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient(
  process.env.IS_OFFLINE && process.env.DYNAMODB_ENDPOINT
    ? {
        region: 'localhost',
        endpoint: process.env.DYNAMODB_ENDPOINT
      }
    : {}
);

const get = async (currPair: CurrencyPair): Promise<DbPayload> => {
  return await dbClient
    .get({
      TableName: tableName,
      Key: {
        ExchangeRateKey: utils.buildKey(currPair)
      }
    })
    .promise()
    .then((output: GetItemOutput) => {
      const queryOutput: DbPayload = {
        statusCode: StatusCode.success,
        payload: output.Item
      };
      return queryOutput;
    })
    .catch((error: AWSError) => {
      const queryError: DbPayload = {
        statusCode: error.statusCode || StatusCode.notImplemented,
        payload: error.message
      };
      return queryError;
    });
};

const list = async (): Promise<DbPayload> => {
  return await dbClient
    .scan({
      TableName: tableName
    })
    .promise()
    .then((output: ScanOutput) => {
      const statusCode: number = output.Items ? StatusCode.success : StatusCode.noContent;
      return {
        statusCode: statusCode,
        payload: output
      };
    })
    .catch((error: AWSError) => {
      return {
        statusCode: error.statusCode || StatusCode.notImplemented,
        payload: error.message
      };
    });
};

const batchWrite = async (ratePairs: ExchangeRatePair[]): Promise<DbPayload> => {
  const timeStamp = Date.now();

  const params = {
    RequestItems: {
      [tableName]: ratePairs.map((rp: ExchangeRatePair) => ({
        PutRequest: {
          Item: {
            ExchangeRateKey: utils.buildKey(rp),
            BaseCurrency: rp.baseCurr,
            Date: rp.date,
            QuoteCurrency: rp.quoteCurr,
            Rate: rp.rate,
            CreatedAt: timeStamp
          }
        }
      }))
    }
  };

  return await dbClient
    .batchWrite(params)
    .promise()
    .then((output: BatchWriteItemOutput) => {
      return {
        statusCode: StatusCode.success,
        payload: output
      };
    })
    .catch((error: AWSError) => {
      return {
        statusCode: error.statusCode || StatusCode.notImplemented,
        payload: error.message
      };
    });
};

export const db = {
  get: dbLogWrapper(get),
  list: dbLogWrapper(list),
  put: dbLogWrapper(batchWrite)
};
