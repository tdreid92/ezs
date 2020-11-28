import {
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
import { log } from '../../layers/common/nodejs/utils/lambda-logger';
import { Context } from 'aws-lambda';
log.setKey('FunctionNamespace', FunctionNamespace.FIND_CRYPTOCURRENCY_RATE);

const handler = async (event: RateRequest, context: Context): Promise<DbPayload> => {
  log.info('Request started');
  log.setKey('request.body', event);

  const response: DbPayload = await reduce<Promise<DbPayload>>(
    event.requestType,
    {
      [DbRequestType.GET]: async () => get(event.getRateRequest),
      [DbRequestType.PUT]: async () => batchWrite(event.putRatesRequest),
      [DbRequestType.LIST]: async () => list()
    },
    () => {
      const defaultResponse: Promise<DbPayload> = Promise.resolve({
        statusCode: StatusCode.internalServerError,
        payload: ''
      });
      log.setKey('response.payload', response);
      log.setKey('response.statusCode', response.statusCode);
      log.error('Request failed');
      return defaultResponse;
    }
  );

  log.setKey('response.payload', response);
  log.setKey('response.statusCode', response.statusCode);
  log.info('Request completed');
  return response;
};

exports.handler = log.handler(handler);
