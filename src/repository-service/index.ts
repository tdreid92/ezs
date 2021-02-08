import { log } from '../../layers/common/nodejs/log/sam-logger';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { service } from './lib/service';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { config } from './lib/config';
import { PayloadRequest } from '../../layers/common/nodejs/models/invoker/payload';
import { eventLogger, EventResponse, LoggerMode } from '../../layers/common/nodejs/log/event-logger';
import { DatabaseRequest } from '../../layers/common/nodejs/models/database-request';

log.setKey(mdcKeys.functionNamespace, config.thisFunctionNamespace).setKey(mdcKeys.stage, config.stage);

export const handler: middy.Middy<PayloadRequest<DatabaseRequest>, EventResponse> = middy(service.handle);

exports.handler = handler
  .use(doNotWaitForEmptyEventLoop({ runOnBefore: true, runOnAfter: true, runOnError: false }))
  .use(httpErrorHandler({ logger: undefined }))
  .use(eventLogger({ logger: log, mode: LoggerMode.Lambda }));
