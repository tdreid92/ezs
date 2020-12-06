import awsServerlessExpress from 'aws-serverless-express';
import { app } from './lib/app';
import { log } from '../../layers/common/nodejs/utils/lambda-logger';
import { FunctionNamespace } from '../../layers/common/nodejs/utils/common-constants';
import { Server } from 'http';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';
import { mdcKey } from '../../layers/common/nodejs/utils/log-constants';
import middy from '@middy/core';
import errorLogger from '@keboola/middy-error-logger';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { middleware } from '../../layers/common/nodejs/utils/middleware';

log.setKey(mdcKey.functionNamespace, FunctionNamespace.ExchangeRateController);

const server: Server = awsServerlessExpress.createServer(app);

const apiGatewayProxyHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> =>
  awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;

//http-errors
const handler: middy.Middy<APIGatewayProxyEvent, APIGatewayProxyResult> = middy(
  apiGatewayProxyHandler
);

exports.handler = handler
  .use(doNotWaitForEmptyEventLoop({ runOnAfter: true, runOnError: true }))
  .use(middleware.apiGatewayLoggerHandler(log))
  .use(errorLogger());
