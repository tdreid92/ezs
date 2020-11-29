import awsServerlessExpress from 'aws-serverless-express';
import { app } from './lib/app';
import { log } from '../../layers/common/nodejs/utils/lambda-logger';
import { FunctionNamespace } from '../../layers/common/nodejs/utils/common-constants';
import { Server } from 'http';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { loggerKeys } from '../../layers/common/nodejs/utils/log-constants';

log.setKey(loggerKeys.functionNamespace, FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER);

const server: Server = awsServerlessExpress.createServer(app);

const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  log.setKey(loggerKeys.resource, event.resource);
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};

exports.handler = log.handler(handler);
