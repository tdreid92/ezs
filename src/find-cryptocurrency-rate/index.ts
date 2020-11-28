import {
  DbPayload,
  DbRequestType,
  FunctionNamespace,
  RateRequest,
  StatusCode
} from '../../layers/common/nodejs/utils/common-constants';
import { reduce } from 'conditional-reduce';
import { lambdaLoggingInterceptor, log } from '../../layers/common/nodejs/utils/lambda-logger';
import { logConsts } from '../../layers/common/nodejs/utils/log-constants';
import { db } from './dynamoDb';

log.setKey(logConsts.functionNamespace, FunctionNamespace.FIND_CRYPTOCURRENCY_RATE);

const handler = lambdaLoggingInterceptor(
  async (event: RateRequest): Promise<DbPayload> => {
    const response: DbPayload = await reduce<Promise<DbPayload>>(
      event.requestType,
      {
        [DbRequestType.GET]: async () => db.get(event.getRateRequest),
        [DbRequestType.PUT]: async () => db.put(event.putRatesRequest),
        [DbRequestType.LIST]: async () => db.list()
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
