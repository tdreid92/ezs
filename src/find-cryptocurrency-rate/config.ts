import { DynamoDB } from 'aws-sdk';

const dbClientOptions = () => {
  return process.env.IS_OFFLINE && process.env.DYNAMODB_ENDPOINT
    ? {
        region: 'localhost',
        endpoint: process.env.DYNAMODB_ENDPOINT
      }
    : {};
};

export const ddb = {
  client: new DynamoDB.DocumentClient(dbClientOptions()),
  tableName: process.env.DYNAMODB_TABLE != undefined ? process.env.DYNAMODB_TABLE : 'test'
};
