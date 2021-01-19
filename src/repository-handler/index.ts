import { log } from '../../layers/common/nodejs/log/sam-logger';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { service } from './lib/service';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { config } from './lib/config';
import { PayloadRequest, PayloadResponse } from '../../layers/common/nodejs/models/invoker/payload';

log.setKey(mdcKeys.functionNamespace, config).setKey(mdcKeys.stage, config.stage);

export const handler: middy.Middy<PayloadRequest, PayloadResponse> = middy(service.handleCrudEvent);

/**
 * Add middleware sequence to exported handler
 * See https://github.com/middyjs/middy
 */
exports.handler = handler
  .use(doNotWaitForEmptyEventLoop({ runOnBefore: true, runOnAfter: true, runOnError: false }))
  .use(httpErrorHandler({ logger: undefined }));
// .use(lambdaEventLogger({ logger: log, mode: LoggerMode.Controller }));
