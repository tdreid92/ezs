import { DynamoDB } from 'aws-sdk';

const dbClient = (): DynamoDB.DocumentClient => {
  const options =
    process.env.IS_OFFLINE && process.env.DYNAMODB_ENDPOINT
      ? {
          region: 'localhost',
          endpoint: process.env.DYNAMODB_ENDPOINT
        }
      : {};
  return new DynamoDB.DocumentClient(options);
};

const dynamoDbTableName =
  process.env.DYNAMODB_TABLE != undefined ? process.env.DYNAMODB_TABLE : 'test';

export const ddb = {
  client: dbClient(),
  tableName: dynamoDbTableName
};
