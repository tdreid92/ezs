import awsServerlessExpress from 'aws-serverless-express';
import { app } from './lib/app';
import { log } from '../../layers/common/nodejs/utils/lambda-logger';
import { FunctionNamespace } from '../../layers/common/nodejs/utils/common-constants';
import { Server } from 'http';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const server: Server = awsServerlessExpress.createServer(app);
log.setKey('FunctionNamespace', FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER);

const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  log.setKey('resource', event.resource);
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};

exports.handler = log.handler(handler);
