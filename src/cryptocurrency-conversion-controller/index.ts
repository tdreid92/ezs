import awsServerlessExpress from 'aws-serverless-express';
import { app } from './lib/app';
const server = awsServerlessExpress.createServer(app);

export const handler = (event: any, context: any): any => {
  awsServerlessExpress.proxy(server, event, context);
};
