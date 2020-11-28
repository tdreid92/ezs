import {
  DbPayload,
  ExchangeRatePair,
  FunctionNamespace,
  StatusCode
} from '../../../layers/common/nodejs/utils/common-constants';
import { BatchWriteItemOutput } from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk/lib/error';
import { ddb } from '../config';
import { utils } from '../utils';

const eventType: string = FunctionNamespace.FIND_CRYPTOCURRENCY_RATE + '-BATCH-WRITE';

export const batchWrite = async (ratePairs: ExchangeRatePair[]): Promise<DbPayload> => {
  console.info('START Event %s %j: ', eventType, ratePairs);
  console.time(eventType);

  const timeStamp = Date.now();

  const params = {
    RequestItems: {
      [ddb.tableName]: ratePairs.map((rp: ExchangeRatePair) => ({
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

  return await ddb.client
    .batchWrite(params)
    .promise()
    .then((output: BatchWriteItemOutput) => {
      console.info('CLOSE Event %s: %s', eventType, output);
      return {
        statusCode: StatusCode.success,
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
