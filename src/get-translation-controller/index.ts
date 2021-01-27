import { log } from '../../layers/common/nodejs/log/sam-logger';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context, Handler } from 'aws-lambda';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { config } from './lib/config';
import httpEventNormalizer from '@middy/http-event-normalizer';
import {
  eventLogger,
  EventRequest,
  EventResponse,
  GatewayEvent,
  LoggerMode
} from '../../layers/common/nodejs/middleware/event-logger';
import httpSecurityHeaders from '@middy/http-security-headers';
import cors from '@middy/http-cors';
import { customHeaderAppender } from '../../layers/common/nodejs/middleware/custom-headers-appender';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import { inputSchema } from './lib/schema';
import { service } from './lib/service';
import { GetTranslationRequest } from '../../layers/common/nodejs/models/get-translation-request';

const headers = {
  'Content-Type': 'application/json'
};

log.setKey(mdcKeys.functionNamespace, config.thisFunctionNamespace).setKey(mdcKeys.stage, config.stage);

const handler: middy.Middy<GatewayEvent<GetTranslationRequest>, EventResponse> = middy(service.handle);

exports.handler = middy(handler)
  .use(doNotWaitForEmptyEventLoop({ runOnAfter: true, runOnError: true }))
  .use(httpErrorHandler())
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(validator({ inputSchema: inputSchema }))
  .use(eventLogger({ logger: log, mode: LoggerMode.Controller }))
  .use(cors())
  .use(httpSecurityHeaders());
// .use(customHeaderAppender({ headers: headers }));
