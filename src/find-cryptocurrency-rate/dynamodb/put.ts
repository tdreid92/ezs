import {
  ExchangeRatePair,
  FunctionNamespace,
  StatusCode
} from '../../../layers/common/nodejs/utils/common-constants';
import { buildKey, dbClient, DbPayload, tableName } from '../index';
import { GetItemOutput, PutItemOutput } from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk/lib/error';

const eventType: string = FunctionNamespace.FIND_CRYPTOCURRENCY_RATE + '-PUT';

export const put = async (ratePairs: ExchangeRatePair[]): Promise<DbPayload> => {
  console.info('START Event %s %j: ', eventType, ratePairs);
  console.time(eventType);
  //TODO fix logging and add createdAt field
  for (const ratePair of ratePairs) {
    console.log({
      TableName: tableName,
      Item: {
        ExchangeRateKey: buildKey(ratePair),
        BaseCurrency: ratePair.baseCurr,
        Date: ratePair.date,
        QuoteCurrency: ratePair.quoteCurr,
        Rate: ratePair.rate
      }
    });
    await dbClient
      .put({
        TableName: tableName,
        Item: {
          ExchangeRateKey: buildKey(ratePair),
          BaseCurrency: ratePair.baseCurr,
          Date: ratePair.date,
          QuoteCurrency: ratePair.quoteCurr,
          Rate: ratePair.rate
        }
      })
      .promise()
      .then((output: PutItemOutput) => {
        console.info('CLOSE Event %s: %s', eventType, output.Attributes);
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
  }
  return {
    statusCode: StatusCode.success,
    payload: ''
  };
};
