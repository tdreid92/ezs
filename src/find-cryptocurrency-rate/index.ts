import { log } from '../../layers/common/nodejs/log/lambda-logger';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import { middleware } from '../../layers/common/nodejs/middleware/middleware';
import { crudRateService } from './lib/crud-rate-service';
import { inputSchema } from './lib/input-schema';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { FunctionNamespace } from '../../layers/common/nodejs/models/invoker/invoker-options';
import { PayloadResponse } from '../../layers/common/nodejs/models/invoker/payload';
import { RateRequest } from '../../layers/common/nodejs/models/rate-request';

log.setKey(mdcKeys.functionNamespace, FunctionNamespace.ExchangeRateCrudService);

const handler: middy.Middy<RateRequest, PayloadResponse> = middy(crudRateService.handleCrudEvent);

/** Add middleware sequence to exported handler */
exports.handler = handler
  .use(doNotWaitForEmptyEventLoop({ runOnBefore: true, runOnAfter: true, runOnError: false }))
  .use(middleware.requestResponseLogger(log))
  .use(validator({ inputSchema: inputSchema }))
  .use(httpErrorHandler());
