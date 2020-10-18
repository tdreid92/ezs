import {
  FunctionNamespace,
  ExchangeRatePair,
  RateRequest
} from '../../layers/common/nodejs/utils/common-constants';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient({ endpoint: 'http://docker.for.mac.localhost:8000/' });
const tableName = process.env.TableName != undefined ? process.env.TableName : 'test';
const SEP = '_';

const buildKey = (ratePair: ExchangeRatePair): string => {
  return ratePair.baseCurr + SEP + ratePair.date + SEP + ratePair.quoteCurr;
};

const putItemInput = (ratePair: ExchangeRatePair): DynamoDB.DocumentClient.PutItemInput => {
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

const getItemInput = (ratePair: ExchangeRatePair): DynamoDB.DocumentClient.GetItemInput => {
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
    callback(null, {
      statusCode: err ? '400' : '200',
      body: err ? err.message : JSON.stringify(res)
    });
  };
  const data = putItemInput(event.ratePair);

  switch (event.type) {
    case 'GET':
      dynamo.get(getItemInput(event.ratePair), (error, result) => {
        if (error) {
          console.error('STOP Event %s: %s', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, 'Error');
          callback(new Error('FAIL'));
          return;
        }
        let rate: ExchangeRatePair;
        const item = result.Item;
        if (item != undefined) {
          rate = {
            baseCurr: item.BaseCurrency,
            date: item.Date,
            quoteCurr: item.QuoteCurrency,
            rate: item.Rate
          };
          console.info('CLOSE Event %s: %s', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, rate);
          callback(null, rate);
        }
        callback(null, null); //??
      });
      break;
    case 'UPLOAD':
      console.debug('Commence PUT in table %s with value %j', tableName, data);
      dynamo.put(data, (error, result) => {
        if (error) {
          console.error('CLOSE Event %s: %s', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, 'Error');
          callback(new Error('FAIL'));
          return;
        }
        console.info('CLOSE Event %s: %s', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, 'Success');
        callback(null, result);
      });
      break;
    case 'DELETE':
      break;
    default:
      done(new Error(`Unsupported method "${event.type}"`), 'x');
  }
};
