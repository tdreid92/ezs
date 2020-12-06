import {
  PayloadResponse,
  FunctionNamespace,
  RateRequest
} from '../../layers/common/nodejs/utils/common-constants';
import { log } from '../../layers/common/nodejs/utils/lambda-logger';
import { mdcKey } from '../../layers/common/nodejs/utils/log-constants';
import middy from '@middy/core';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import { middleware } from '../../layers/common/nodejs/utils/middleware';
import { exchangeRateCrudService } from './exchangeRateCrudService';
import { inputSchema } from './models/input-schema';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';

log.setKey(mdcKey.functionNamespace, FunctionNamespace.ExchangeRateCrudService);

const handler: middy.Middy<RateRequest, PayloadResponse> = middy(
  exchangeRateCrudService.findExchangeRate
);

/** Add middleware sequence to exported handler */
exports.handler = handler
  .use(doNotWaitForEmptyEventLoop({ runOnBefore: true, runOnAfter: true, runOnError: false }))
  .use(middleware.lambdaLoggerHandler(log))
  .use(validator({ inputSchema: inputSchema }))
  .use(httpErrorHandler());
