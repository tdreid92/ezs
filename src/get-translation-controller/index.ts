import { log } from '../../layers/common/nodejs/log/sam-logger';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { config } from './lib/config';
import httpEventNormalizer from '@middy/http-event-normalizer';
import { eventLogger, LoggerMode } from '../../layers/common/nodejs/log/event-logger';
import httpSecurityHeaders from '@middy/http-security-headers';
import cors from '@middy/http-cors';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import { inputSchema } from './lib/schema';
import { service } from './lib/service';
import { APIGatewayEvent, APIGatewayResult, EventResponse } from '../../layers/common/nodejs/log/event';

const headers = {
  'Content-Type': 'application/json'
};

log.setKey(mdcKeys.functionNamespace, config.thisFunctionNamespace).setKey(mdcKeys.stage, config.stage);

const handler: middy.Middy<APIGatewayEvent, APIGatewayResult> = middy(service.handle);

exports.handler = middy(handler)
  .use(doNotWaitForEmptyEventLoop({ runOnAfter: true, runOnError: true }))
  .use(httpErrorHandler())
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(validator({ inputSchema: inputSchema }))
  .use(eventLogger({ logger: log, mode: LoggerMode.Gateway }))
  .use(cors())
  .use(httpSecurityHeaders());
// .use(customHeaderAppender({ headers: headers }));
