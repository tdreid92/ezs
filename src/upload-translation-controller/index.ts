import { log } from '../../layers/common/nodejs/log/sam-logger';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { config } from './lib/config';
import {
  GatewayEvent,
  eventLogger,
  EventRequest,
  EventResponse,
  LoggerMode
} from '../../layers/common/nodejs/middleware/event-logger';
import httpSecurityHeaders from '@middy/http-security-headers';
import cors from '@middy/http-cors';
import { customHeaderAppender } from '../../layers/common/nodejs/middleware/custom-headers-appender';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import { schema } from './lib/schema';
import jsonBodyParser from '@middy/http-json-body-parser';
import { service } from './lib/service';
import { BulkUploadTranslationRequest } from '../../layers/common/nodejs/models/bulk-upload-translation-request';

const headers = {
  'Content-Type': 'application/json'
};

log.setKey(mdcKeys.functionNamespace, config.thisFunctionNamespace).setKey(mdcKeys.stage, config.stage);

const handler: middy.Middy<GatewayEvent<BulkUploadTranslationRequest>, EventResponse> = middy(service.handle);

exports.handler = middy(handler)
  .use(doNotWaitForEmptyEventLoop({ runOnAfter: true, runOnError: true }))
  .use(jsonBodyParser())
  .use(httpErrorHandler())
  .use(validator({ inputSchema: schema }))
  .use(eventLogger({ logger: log, mode: LoggerMode.Controller }))
  .use(cors())
  .use(httpSecurityHeaders());
// .use(customHeaderAppender({ headers: headers }));
