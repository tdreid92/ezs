import {
  CurrencyPair,
  DbPayload,
  DbRequestType,
  FunctionNamespace,
  RateRequest,
  StatusCode
} from '../../layers/common/nodejs/utils/common-constants';
import { get } from './dynamoDb/get';
import { batchWrite } from './dynamoDb/batchWrite';
import { list } from './dynamoDb/list';
import { reduce } from 'conditional-reduce';

export const handler = async (event: RateRequest, context): Promise<DbPayload> => {
  console.info('START Event %s %j: ', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, event);
  console.time(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE);

  const response: DbPayload = await reduce<Promise<DbPayload>>(
    event.requestType,
    {
      [DbRequestType.GET]: async () => get(event.getRateRequest),
      [DbRequestType.PUT]: async () => batchWrite(event.putRatesRequest),
      [DbRequestType.LIST]: async () => list()
    },
    () => {
      console.error('Request type not found');
      return Promise.resolve({
        statusCode: StatusCode.internalServerError,
        payload: ''
      });
    }
  );

  console.info('CLOSE Event %s %j: ', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE, event);
  console.timeEnd(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE);
  return response;
};
