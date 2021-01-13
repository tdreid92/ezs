import { log } from '../../layers/common/nodejs/log/sam-logger';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { lambdaLogger } from '../../layers/common/nodejs/middleware/lambda-logger';
import { crudRateService } from './lib/crud-rate-service';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { FunctionNamespace } from '../../layers/common/nodejs/models/invoker/invoker-options';
import { ResponseEntity } from '../../layers/common/nodejs/models/invoker/payload';
import { RateRequest } from '../../layers/common/nodejs/models/rate-request';
import { config } from '../exchange-rate-controller/lib/config';

log.setKey(mdcKeys.functionNamespace, FunctionNamespace.ExchangeRateCrudService).setKey(mdcKeys.stage, config.stage);

export const handler: middy.Middy<RateRequest, ResponseEntity> = middy(crudRateService.handleCrudEvent);

/** Add middleware sequence to exported handler */
exports.handler = handler
  .use(doNotWaitForEmptyEventLoop({ runOnBefore: true, runOnAfter: true, runOnError: false }))
  .use(httpErrorHandler({ logger: undefined }))
  .use(lambdaLogger({ logger: log }));
// .use(validator({ inputSchema: inputSchema }));
