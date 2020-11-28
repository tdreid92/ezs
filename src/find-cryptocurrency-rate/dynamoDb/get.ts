import {
  CurrencyPair,
  DbPayload,
  StatusCode
} from '../../../layers/common/nodejs/utils/common-constants';
import { GetItemOutput } from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk/lib/error';
import { ddb } from '../config';
import { utils } from '../utils';
import { log } from '../../../layers/common/nodejs/utils/lambda-logger';

export const get = async (currPair: CurrencyPair): Promise<DbPayload> => {
  log.setKey('database.query.request', currPair);
  log.setKey('database.query.type', 'GET');
  log.info('Database request GET started');

  return await ddb.client
    .get({
      TableName: ddb.tableName,
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
      log.setKey('database.payload', output);
      log.info('Database request GET completed');
      return queryOutput;
    })
    .catch((error: AWSError) => {
      const queryError: DbPayload = {
        statusCode: error.statusCode || StatusCode.notImplemented,
        payload: error.message
      };
      log.setKey('database.error.statusCode', error.statusCode);
      log.setKey('database.error.message', error);
      log.info('Database request GET failed');
      return queryError;
    });
};
