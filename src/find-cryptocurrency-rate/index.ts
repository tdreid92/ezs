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
import { dbUtils } from './utils';

log.setKey(loggerKeys.functionNamespace, FunctionNamespace.FIND_CRYPTOCURRENCY_RATE);

const getDefaultCaseDbResult = async (): Promise<DbPayload> => {
  log.error('Default case');
  return Promise.resolve({
    statusCode: StatusCode.notImplemented,
    payload: ''
  });
};

const handler = async (event: RateRequest): Promise<DbPayload> =>
  await reduce<Promise<DbPayload>>(
    event.requestType,
    {
      [DbRequestType.GET]: async () => db.get(dbUtils.buildGetItemParams(event.getRateRequest)),
      [DbRequestType.LIST]: async () => db.list(dbUtils.buildListItemsParams()),
      [DbRequestType.PUT]: async () => db.put(dbUtils.buildBatchWriteParams(event.putRatesRequest))
    },
    () => getDefaultCaseDbResult()
  );

exports.handler = log.handler(logWrapper(handler));
