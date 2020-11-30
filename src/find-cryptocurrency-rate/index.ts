import {
  CurrencyPair,
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
import { dbUtils } from './utils';

log.setKey(loggerKeys.functionNamespace, FunctionNamespace.FIND_CRYPTOCURRENCY_RATE);

const defaultCaseDbResult: Promise<DbPayload> = Promise.resolve({
  statusCode: StatusCode.notImplemented,
  payload: ''
});

const getDefaultCaseDbResult = async (): Promise<DbPayload> => {
  log.error('Default case');
  return defaultCaseDbResult;
};

export const handler = async (event: RateRequest): Promise<DbPayload> =>
  event.requestType
    ? await reduce<Promise<DbPayload>>(
        event.requestType,
        {
          [DbRequestType.GET]: async () => db.get(event.getRateRequest),
          [DbRequestType.LIST]: async () => db.list(),
          [DbRequestType.PUT]: async () => db.put(event.putRatesRequest)
        },
        () => getDefaultCaseDbResult()
      )
    : defaultCaseDbResult;

exports.handler = log.handler(logWrapper(handler));
