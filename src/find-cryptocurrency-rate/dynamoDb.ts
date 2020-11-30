import {
  CurrencyPair,
  DbPayload,
  ExchangeRatePair,
  StatusCode
} from '../../layers/common/nodejs/utils/common-constants';
import { AWSError } from 'aws-sdk/lib/error';
import { dbLogWrapper } from '../../layers/common/nodejs/utils/lambda-logger';
import { DynamoDB } from 'aws-sdk';
import { dbUtils } from './utils';

const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient(
  process.env.IS_OFFLINE && process.env.DYNAMODB_ENDPOINT
    ? {
        region: 'localhost',
        endpoint: process.env.DYNAMODB_ENDPOINT
      }
    : {}
);

//TODO remove this default case
const defaultCaseDbResult: Promise<DbPayload> = Promise.resolve({
  statusCode: StatusCode.notImplemented,
  payload: ''
});

const get = async (currPair: CurrencyPair | undefined): Promise<DbPayload> => {
  if (!currPair) {
    return defaultCaseDbResult;
  }
  const input: DynamoDB.GetItemInput = dbUtils.buildGetItemParams(currPair);
  return getItem(input);
};

const list = async (): Promise<DbPayload> => {
  const input: DynamoDB.ScanInput = dbUtils.buildListItemsParams();
  return scanItems(input);
};

const put = async (ratePairs: ExchangeRatePair[] | undefined): Promise<DbPayload> => {
  if (!ratePairs) {
    return defaultCaseDbResult;
  }
  const input: DynamoDB.BatchWriteItemInput = dbUtils.buildBatchWriteParams(ratePairs);
  return batchWriteItems(input);
};

const getItem = dbLogWrapper(
  async (params: DynamoDB.GetItemInput): Promise<DbPayload> =>
    await dbClient
      .get(params)
      .promise()
      .then((output: DynamoDB.GetItemOutput) => {
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
      })
);

const scanItems = dbLogWrapper(
  async (params: DynamoDB.DocumentClient.ScanInput): Promise<DbPayload> =>
    await dbClient
      .scan(params)
      .promise()
      .then((output: DynamoDB.DocumentClient.ScanOutput) => {
        return {
          statusCode: output.Items ? StatusCode.success : StatusCode.noContent,
          payload: output
        };
      })
      .catch((error: AWSError) => {
        return {
          statusCode: error.statusCode || StatusCode.notImplemented,
          payload: error.message
        };
      })
);

const batchWriteItems = dbLogWrapper(
  async (params: DynamoDB.BatchWriteItemInput): Promise<DbPayload> =>
    await dbClient
      .batchWrite(params)
      .promise()
      .then((output: DynamoDB.BatchWriteItemOutput) => {
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
      })
);

export const db = {
  get: get,
  list: list,
  put: put
};
