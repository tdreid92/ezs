import { DbPayload, StatusCode } from '../../layers/common/nodejs/utils/common-constants';
import { AWSError } from 'aws-sdk/lib/error';
import { dbLogWrapper } from '../../layers/common/nodejs/utils/lambda-logger';
import { DynamoDB } from 'aws-sdk';

const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient(
  process.env.IS_OFFLINE && process.env.DYNAMODB_ENDPOINT
    ? {
        region: 'localhost',
        endpoint: process.env.DYNAMODB_ENDPOINT
      }
    : {}
);

const get = async (params: DynamoDB.GetItemInput): Promise<DbPayload> =>
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
    });

const list = async (params: DynamoDB.DocumentClient.ScanInput): Promise<DbPayload> =>
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
    });

const batchWrite = async (params: DynamoDB.BatchWriteItemInput): Promise<DbPayload> =>
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
    });

export const db = {
  get: dbLogWrapper(get),
  list: dbLogWrapper(list),
  put: dbLogWrapper(batchWrite)
};
