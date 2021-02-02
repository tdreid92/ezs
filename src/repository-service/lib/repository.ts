import { AWSError } from 'aws-sdk/lib/error';
import { dbLogWrapper, log } from '../../../layers/common/nodejs/log/sam-logger';
import { DynamoDB } from 'aws-sdk';
import { config } from './config';
import { HttpStatus } from '../../../layers/common/nodejs/utils/http-status';
import { PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { GetTranslationResponse } from '../../../layers/common/nodejs/models/get-translation-response';
import { HttpError } from 'http-errors';
import { BulkUploadTranslationResponse } from '../../../layers/common/nodejs/models/bulk-upload-translation-response';

const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient(
  config.isOffline
    ? {
        region: 'localhost',
        endpoint: config.tableEndpoint
      }
    : {}
);

const get = async (params: DynamoDB.GetItemInput): Promise<PayloadResponse<GetTranslationResponse>> => {
  try {
    return await dbClient
      .get(params)
      .promise()
      .then((output: DynamoDB.GetItemOutput) => {
        if (output.Item) {
          delete output.Item['translationKey'];
          delete output.Item['createdAt'];
        }
        return {
          statusCode: HttpStatus.Success,
          body: (output.Item as unknown) as GetTranslationResponse
        } as PayloadResponse<GetTranslationResponse>;
      });
  } catch (AWSError) {
    throw ({
      statusCode: AWSError.statusCode || HttpStatus.NotImplemented,
      body: AWSError.message
    } as unknown) as HttpError;
  }
};

const scan = async (params: DynamoDB.ScanInput): Promise<PayloadResponse<GetTranslationResponse[]>> => {
  try {
    return await dbClient
      .scan(params)
      .promise()
      .then(
        (output: DynamoDB.ScanOutput) =>
          ({
            statusCode: output.Items ? HttpStatus.Success : HttpStatus.NoContent,
            body: output as GetTranslationResponse[]
          } as PayloadResponse<GetTranslationResponse[]>)
      );
  } catch (AWSError) {
    throw ({
      statusCode: AWSError.statusCode || HttpStatus.NotImplemented,
      body: AWSError.message
    } as unknown) as HttpError;
  }
};

const update = async (params: DynamoDB.Update): Promise<PayloadResponse<any>> => {
  try {
    return await dbClient
      .update(params)
      .promise()
      .then((output: DynamoDB.UpdateItemOutput) => {
        return {
          statusCode: HttpStatus.Success,
          body: output
        };
      });
  } catch (AWSError) {
    throw ({
      statusCode: AWSError.statusCode || HttpStatus.NotImplemented,
      body: AWSError.message
    } as unknown) as HttpError;
  }
};

const batchWrite = async (
  params: DynamoDB.BatchWriteItemInput
): Promise<PayloadResponse<BulkUploadTranslationResponse>> => {
  try {
    return await dbClient
      .batchWrite(params)
      .promise()
      .then(
        (output: DynamoDB.BatchWriteItemOutput) =>
          ({
            statusCode: HttpStatus.Success,
            body: output as BulkUploadTranslationResponse
          } as PayloadResponse<BulkUploadTranslationResponse>)
      );
  } catch (AWSError) {
    throw ({
      statusCode: AWSError.statusCode || HttpStatus.NotImplemented,
      body: AWSError.message
    } as unknown) as HttpError;
  }
};

export const repository = {
  get: dbLogWrapper(log, get),
  scan: dbLogWrapper(log, scan),
  update: dbLogWrapper(log, scan),
  batchWrite: dbLogWrapper(log, batchWrite)
};
