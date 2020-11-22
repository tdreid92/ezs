import {
  CurrencyPair,
  DbRequestType,
  FunctionNamespace,
  RateRequest,
  StatusCode
} from '../../layers/common/nodejs/utils/common-constants';
import { DynamoDB } from 'aws-sdk';
import { get } from './dynamodb/get';
import { put } from './dynamodb/put';
import { list } from './dynamodb/list';

let options = {};

// connect to local DB if running offline

//TODO fix local config
if (process.env.IS_OFFLINE == 'true') {
  options = {
    region: 'localhost',
    endpoint: 'http://docker.for.mac.localhost:8000/'
  };
  console.log('local configured');
}

export const dbClient = new DynamoDB.DocumentClient({
  region: 'localhost',
  endpoint: 'http://docker.for.mac.localhost:8000/'
});
export const tableName = process.env.TableName != undefined ? process.env.TableName : 'test';

export interface DbPayload {
  statusCode: number;
  payload: any;
}

export const buildKey = (currPair: CurrencyPair): string => {
  const sep = '.';
  return currPair.baseCurr + sep + currPair.date + sep + currPair.quoteCurr;
};

export const handler = async (event: RateRequest, context): Promise<DbPayload> => {
  console.info('START Event %s %j: ', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, event);
  console.time(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE);

  let response: DbPayload = {
    statusCode: StatusCode.internalServerError,
    payload: ''
  };

  //TODO: fix logging
  switch (event.requestType) {
    case DbRequestType.GET:
      console.debug('Enter GetRateRequest');
      response = await get(event.getRateRequest);
      console.debug('GetRateRequest: ' + response.statusCode);
      break;
    case DbRequestType.PUT:
      console.debug('Enter PutRatesRequest');
      response = await put(event.putRatesRequest);
      console.debug('PutRatesRequest: ' + response.statusCode);
      break;
    case DbRequestType.LIST:
      console.debug('Enter ListRateRequest');
      response = await list();
      console.debug('ListRatesRequest: ' + response.statusCode);
      break;
    default:
      console.log('do nothing');
  }
  console.info('CLOSE Event %s %j: ', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, event);
  console.timeEnd(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE);
  return response;
};
