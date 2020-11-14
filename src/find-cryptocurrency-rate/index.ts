import {
  FunctionNamespace,
  ExchangeRate,
  RateRequest
} from '../../layers/common/nodejs/utils/common-constants';
import { DynamoDB } from 'aws-sdk';
import { LambdaResponse } from '../../layers/common/nodejs/models/lambda';

const dynamo = new DynamoDB.DocumentClient({ endpoint: 'http://docker.for.mac.localhost:8000/' });
const tableName = process.env.TableName != undefined ? process.env.TableName : 'test';
const SEP = '_';

const buildKey = (ratePair: ExchangeRate): string => {
  return ratePair.baseCurr + SEP + ratePair.date + SEP + ratePair.quoteCurr;
};

const putItemInput = (ratePair: ExchangeRate): DynamoDB.DocumentClient.PutItemInput => {
  return {
    TableName: tableName,
    Item: {
      RateKey: buildKey(ratePair), //Rename to HashKey
      BaseCurrency: ratePair.baseCurr,
      Date: ratePair.date,
      QuoteCurrency: ratePair.quoteCurr,
      Rate: ratePair.rate
    }
  };
};

const getItemInput = (ratePair: ExchangeRate): DynamoDB.DocumentClient.GetItemInput => {
  return {
    Key: {
      RateKey: buildKey(ratePair) //Rename to HashKey
    },
    TableName: tableName
  };
};

export const handler = (event: RateRequest, context: any, callback) => {
  console.info('START Event %s %j: ', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, event);
  console.time(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE);

  const done = (err, res) => {
    console.timeEnd(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE);
    const resp = new LambdaResponse()
      .setStatusCode(err ? 500 : 200)
      .setPayload(err ? err.message : res);
    callback(null, resp);
  };

  const dynamoGet = (ratePair: ExchangeRate): void => {
    dynamo.get(getItemInput(ratePair), (err, res) => {
      if (err) {
        console.error('STOP Event %s: %s', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, 'Error');
        done(new Error('Error getting rate'), null);
      } else {
        let rate: ExchangeRate;
        const item = res.Item;
        if (item != undefined) {
          rate = {
            baseCurr: item.BaseCurrency,
            date: item.Date,
            quoteCurr: item.QuoteCurrency,
            rate: item.Rate
          };
          console.info('CLOSE Event %s: %s', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, rate);
          done(null, rate);
        } else {
          console.info(
            'CLOSE Event %s: %s',
            FunctionNamespace.FIND_CRYPTOCURRENCY_RATE,
            'NOT FOUND'
          );
          done(null, {
            baseCurr: ratePair.baseCurr,
            date: ratePair.baseCurr,
            quoteCurr: ratePair.baseCurr,
            rate: -1
          });
        }
      }
    });
  };

  const dynamoPut = (ratePair: ExchangeRate) => {
    dynamo.put(putItemInput(ratePair), (err) => {
      if (err) {
        console.error('CLOSE Event %s: %s', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, 'Error');
        done(new Error('Error uploading rate'), null);
      } else {
        console.info('CLOSE Event %s: %s', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, 'Success');
        done(null, 'Success');
      }
    });
  };

  switch (event.type) {
    case 'GET':
      dynamoGet(event.ratePair);
      break;
    case 'UPLOAD':
      dynamoPut(event.ratePair);
      break;
    case 'DELETE':
    default:
      done(new Error(`Unsupported method "${event.type}"`), 'x');
  }
};
