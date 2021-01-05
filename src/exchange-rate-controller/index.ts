import awsServerlessExpress from 'aws-serverless-express';
import { app } from './lib/app';
import { log } from '../../layers/common/nodejs/log/sam-logger';
import { Server } from 'http';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Context } from 'aws-lambda';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpSecurityHeaders from '@middy/http-security-headers';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { FunctionNamespace } from '../../layers/common/nodejs/models/invoker/invoker-options';
import { ApiGatewayHeaders } from '../../layers/common/nodejs/types/next';
import { customHeaderAppender } from '../../layers/common/nodejs/middleware/custom-headers-appender';
import { gatewayLogger } from '../../layers/common/nodejs/middleware/gateway-logger';

const headers: ApiGatewayHeaders = {
  'Content-Type': 'application/json'
};

log.setKey(mdcKeys.functionNamespace, FunctionNamespace.ExchangeRateController);

const server: Server = awsServerlessExpress.createServer(app);

const apiGatewayProxyHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;

const handler: middy.Middy<APIGatewayProxyEvent, APIGatewayProxyResult> = middy(apiGatewayProxyHandler);

/** Add middleware sequence to exported handler */
exports.handler = handler
  .use(doNotWaitForEmptyEventLoop({ runOnAfter: true, runOnError: true }))
  .use(gatewayLogger({ logger: log }))
  .use(customHeaderAppender({ headers: headers }))
  .use(cors())
  .use(httpSecurityHeaders());
