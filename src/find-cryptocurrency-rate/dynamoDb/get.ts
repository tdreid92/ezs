import {
  CurrencyPair,
  DbPayload,
  FunctionNamespace,
  StatusCode
} from '../../../layers/common/nodejs/utils/common-constants';
import { GetItemOutput } from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk/lib/error';
import { ddb } from '../config';
import { buildKey } from '../utils';

const eventType: string = FunctionNamespace.FIND_CRYPTOCURRENCY_RATE + '-GET';

export const get = async (currPair: CurrencyPair): Promise<DbPayload> => {
  console.info('START Event %s %j: ', eventType, currPair);
  console.time(eventType);

  return await ddb.client
    .get({
      TableName: ddb.tableName,
      Key: {
        ExchangeRateKey: buildKey(currPair)
      }
    })
    .promise()
    .then((output: GetItemOutput) => {
      console.info('GET Item Success %s: %s', eventType, output);
      const statusCode: number = output.Item ? StatusCode.success : StatusCode.noContent;
      return {
        statusCode: statusCode,
        payload: output.Item
      };
    })
    .catch((error: AWSError) => {
      console.error('GET Event Error %s: %s', eventType, error.message);
      return {
        statusCode: error.statusCode || StatusCode.notImplemented,
        payload: error.message
      };
    })
    .finally(() => {
      console.info('CLOSE Event %s: %s', eventType);
      console.timeEnd(eventType);
    });
};
