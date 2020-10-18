import awsServerlessExpress from 'aws-serverless-express';
import { app } from './lib/app';
import { FunctionNamespace } from '../../layers/common/nodejs/utils/common-constants';
const server = awsServerlessExpress.createServer(app);

export const handler = (event: any, context: any): any => {
  console.debug('START Event: %s %j', FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER, event);
  awsServerlessExpress.proxy(server, event, context);
};
