import {
  DbPayload,
  DbRequestType,
  FunctionNamespace,
  RateRequest,
  StatusCode
} from '../../layers/common/nodejs/utils/common-constants';
import { reduce } from 'conditional-reduce';
import { logWrapper, log } from '../../layers/common/nodejs/utils/lambda-logger';
import { loggerKeys } from '../../layers/common/nodejs/utils/log-constants';
import { db } from './dynamoDb';

log.setKey(loggerKeys.functionNamespace, FunctionNamespace.FIND_CRYPTOCURRENCY_RATE);

const handler = async (event: RateRequest): Promise<DbPayload> => {
  return await reduce<Promise<DbPayload>>(
    event.requestType,
    {
      [DbRequestType.GET]: async () => db.get(event.getRateRequest),
      [DbRequestType.PUT]: async () => db.put(event.putRatesRequest),
      [DbRequestType.LIST]: async () => db.list()
    },
    () => {
      const defaultResponse: Promise<DbPayload> = Promise.resolve({
        statusCode: StatusCode.notImplemented,
        payload: ''
      });
      log.error('Request failed');
      return defaultResponse;
    }
  );
};

exports.handler = log.handler(logWrapper(handler));
