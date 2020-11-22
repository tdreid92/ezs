import {
  ExchangeRatePair,
  FunctionNamespace,
  StatusCode
} from '../../../layers/common/nodejs/utils/common-constants';
import { dbClient, DbPayload, tableName } from '../index';
import { ScanOutput } from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk/lib/error';

const eventType: string = FunctionNamespace.FIND_CRYPTOCURRENCY_RATE + '-LIST';

export const list = async (): Promise<DbPayload> => {
  console.info('START Event %s ', eventType);
  console.time(eventType);
  //TODO: remove key from results
  return await dbClient
    .scan({
      TableName: tableName
    })
    .promise()
    .then((output: ScanOutput) => {
      console.info('CLOSE Event %s: %s', eventType, output.Items);
      const statusCode: number = output.Items ? StatusCode.success : StatusCode.noContent;
      return {
        statusCode: statusCode,
        payload: output
      };
    })
    .catch((error: AWSError) => {
      console.error('CLOSE Event %s: %s', eventType, error.message);
      return {
        statusCode: error.statusCode || StatusCode.notImplemented,
        payload: error.message
      };
    })
    .finally(() => console.timeEnd(eventType));
};
