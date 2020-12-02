import {
  DbPayload,
  FunctionNamespace,
  RateRequest
} from '../../layers/common/nodejs/utils/common-constants';
import { log } from '../../layers/common/nodejs/utils/lambda-logger';
import { mdcKey } from '../../layers/common/nodejs/utils/log-constants';
import middy from '@middy/core';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import { middleware } from '../../layers/common/nodejs/utils/middleware';
import { service } from './service';
import { inputSchema } from './models/input-schema';

log.setKey(mdcKey.functionNamespace, FunctionNamespace.ExchangeRateCrudService);

const handler: middy.Middy<RateRequest, DbPayload> = middy(service.findExchangeRate);

// add middleware sequence to exported handler
exports.handler = handler
  .use(validator({ inputSchema: inputSchema }))
  .use(httpErrorHandler())
  .use(middleware.loggingHandler(log));
