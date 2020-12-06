import {
  CurrencyPair,
  ExchangeRatePair,
  HttpStatus,
  PayloadResponse
} from '../../layers/common/nodejs/utils/common-constants';
import { AWSError } from 'aws-sdk/lib/error';
import { dbLogWrapper, log } from '../../layers/common/nodejs/utils/lambda-logger';
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
const defaultCaseDbResult: Promise<PayloadResponse> = Promise.resolve({
  statusCode: HttpStatus.NotImplemented,
  body: ''
});

const get = async (currPair: CurrencyPair | undefined): Promise<PayloadResponse> => {
  if (!currPair) {
    return defaultCaseDbResult;
  }
  const input: DynamoDB.GetItemInput = dbUtils.buildGetItemParams(currPair);
  return getItem(input);
};

const list = async (): Promise<PayloadResponse> => {
  const input: DynamoDB.ScanInput = dbUtils.buildListItemsParams();
  return scanItems(input);
};

const put = async (ratePairs: ExchangeRatePair[] | undefined): Promise<PayloadResponse> => {
  if (!ratePairs) {
    return defaultCaseDbResult;
  }
  const input: DynamoDB.BatchWriteItemInput = dbUtils.buildBatchWriteParams(ratePairs);
  return batchWriteItems(input);
};

const getItem = dbLogWrapper(
  log,
  async (params: DynamoDB.GetItemInput): Promise<PayloadResponse> =>
    await dbClient
      .get(params)
      .promise()
      .then((output: DynamoDB.GetItemOutput) => {
        const queryOutput: PayloadResponse = {
          statusCode: HttpStatus.Success,
          body: output.Item
        };
        return queryOutput;
      })
      .catch((error: AWSError) => {
        const queryError: PayloadResponse = {
          statusCode: error.statusCode || HttpStatus.NotImplemented,
          body: error.message
        };
        return queryError;
      })
);

const scanItems = dbLogWrapper(
  log,
  async (params: DynamoDB.DocumentClient.ScanInput): Promise<PayloadResponse> =>
    await dbClient
      .scan(params)
      .promise()
      .then((output: DynamoDB.DocumentClient.ScanOutput) => {
        return {
          statusCode: output.Items ? HttpStatus.Success : HttpStatus.NoContent,
          body: output
        };
      })
      .catch((error: AWSError) => {
        return {
          statusCode: error.statusCode || HttpStatus.NotImplemented,
          body: error.message
        };
      })
);

const batchWriteItems = dbLogWrapper(
  log,
  async (params: DynamoDB.BatchWriteItemInput): Promise<PayloadResponse> =>
    await dbClient
      .batchWrite(params)
      .promise()
      .then((output: DynamoDB.BatchWriteItemOutput) => {
        return {
          statusCode: HttpStatus.Success,
          body: output
        };
      })
      .catch((error: AWSError) => {
        return {
          statusCode: error.statusCode || HttpStatus.NotImplemented,
          body: error.message
        };
      })
);

export const db = {
  get: get,
  list: list,
  put: put
};
