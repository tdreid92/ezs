import { log } from '../../layers/common/nodejs/log/sam-logger';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { config } from './lib/config';
import httpErrorHandler from '@middy/http-error-handler';
import { service } from './lib/service';
import { PayloadRequest } from '../../layers/common/nodejs/models/invoker/payload';
import { eventLogger, LoggerMode } from '../../layers/common/nodejs/log/event-logger';
import { PollyUploadRequest } from '../../layers/common/nodejs/models/polly-upload-request';
import { EventResponse } from '../../layers/common/nodejs/log/event';

log.setKey(mdcKeys.functionNamespace, config.thisFunctionNamespace).setKey(mdcKeys.stage, config.stage);

export const handler: middy.Middy<PayloadRequest<PollyUploadRequest>, EventResponse> = middy(service.handle);

exports.handler = handler
  .use(doNotWaitForEmptyEventLoop({ runOnBefore: true, runOnAfter: true, runOnError: false }))
  .use(httpErrorHandler({ logger: undefined }))
  .use(eventLogger({ logger: log, mode: LoggerMode.Lambda }));
