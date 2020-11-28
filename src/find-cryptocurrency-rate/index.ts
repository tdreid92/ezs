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
import { lambdaLoggingInterceptor, log } from '../../layers/common/nodejs/utils/lambda-logger';
import { logConsts } from '../../layers/common/nodejs/utils/log-constants';

log.setKey(logConsts.functionNamespace, FunctionNamespace.FIND_CRYPTOCURRENCY_RATE);

const handler = lambdaLoggingInterceptor(
  async (event: RateRequest): Promise<DbPayload> => {
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
        // log.setKey('response.payload', response);
        // log.setKey('response.statusCode', response.statusCode);
        log.error('Request failed');
        return defaultResponse;
      }
    );

    // log.setKey('response.payload', response);
    // log.setKey('response.statusCode', response.statusCode);
    log.info('Request completed');
    return response;
  }
);

exports.handler = log.handler(handler);
