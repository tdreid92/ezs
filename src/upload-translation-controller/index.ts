import { log } from '../../layers/common/nodejs/log/sam-logger';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { config } from './lib/config';
import { lambdaEventLogger, LoggerMode } from '../../layers/common/nodejs/middleware/lambda-event-logger';
import httpSecurityHeaders from '@middy/http-security-headers';
import cors from '@middy/http-cors';
import { customHeaderAppender } from '../../layers/common/nodejs/middleware/custom-headers-appender';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import { schema } from './lib/schema';
import jsonBodyParser from '@middy/http-json-body-parser';
import { service } from './lib/service';

const headers = {
  'Content-Type': 'application/json'
};

log.setKey(mdcKeys.functionNamespace, config.thisFunction).setKey(mdcKeys.stage, config.stage);

const handler: middy.Middy<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = middy(service.handle);

exports.handler = middy(handler)
  .use(doNotWaitForEmptyEventLoop({ runOnAfter: true, runOnError: true }))
  .use(jsonBodyParser())
  .use(httpErrorHandler())
  .use(validator({ inputSchema: schema }))
  .use(lambdaEventLogger({ logger: log, mode: LoggerMode.Controller }))
  .use(cors())
  .use(httpSecurityHeaders())
  .use(customHeaderAppender({ headers: headers }));
