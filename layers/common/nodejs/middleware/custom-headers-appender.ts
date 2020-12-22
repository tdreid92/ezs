import { ApiGatewayHeaders, NextFunction } from '../types/next';
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import HandlerLambda = middy.HandlerLambda;

interface CustomHeaderAppenderConfig {
  headers: ApiGatewayHeaders;
}

const appendHeaders = (currentHeaders: ApiGatewayHeaders, customHeaders: ApiGatewayHeaders) => {
  const modifiedHeaders = currentHeaders ? currentHeaders : {};
  for (const header in customHeaders) {
    if (!modifiedHeaders[header]) {
      modifiedHeaders[header] = customHeaders[header];
    }
  }
  return modifiedHeaders;
};

export const customHeaderAppender = (
  config: CustomHeaderAppenderConfig
): middy.MiddlewareObject<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return {
    after: (
      handler: HandlerLambda<APIGatewayProxyEvent, APIGatewayProxyResult, Context>,
      next: NextFunction
    ): void => {
      handler.response.headers = appendHeaders(handler.response.headers, config.headers);
      next();
    },
    onError: (
      handler: HandlerLambda<APIGatewayProxyEvent, APIGatewayProxyResult, Context>,
      next: NextFunction
    ): void => {
      handler.response.headers = appendHeaders(handler.response.headers, config.headers);
      next();
    }
  };
};
