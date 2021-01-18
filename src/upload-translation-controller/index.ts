import { log } from '../../layers/common/nodejs/log/sam-logger';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context, Handler } from 'aws-lambda';
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
import { inputSchema } from './lib/input-schema';
import jsonBodyParser from '@middy/http-json-body-parser';

log.setKey(mdcKeys.functionNamespace, config.thisFunction).setKey(mdcKeys.stage, config.stageName);

const headers = {
  'Content-Type': 'application/json'
};

const service: Handler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  //log.info((<FindTranslationResponse>(<unknown>event.pathParameters)).body.source);
  const res: APIGatewayProxyResultV2 = {
    body: JSON.stringify(event.body),
    statusCode: 200
  };
  return res;
};

const handler: middy.Middy<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = middy(service);

/** Add middleware sequence to exported handler */
exports.handler = handler
  .use(doNotWaitForEmptyEventLoop({ runOnAfter: true, runOnError: true }))
  .use(jsonBodyParser())
  .use(httpErrorHandler())
  .use(validator({ inputSchema: inputSchema }))
  .use(lambdaEventLogger({ logger: log, mode: LoggerMode.Controller }))
  .use(cors())
  .use(httpSecurityHeaders())
  .use(customHeaderAppender({ headers: headers }));
