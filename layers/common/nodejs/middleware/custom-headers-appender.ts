import { ApiGatewayHeaders, NextFunction } from '../types/next';
import middy from '@middy/core';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  APIGatewayProxyResultV2,
  Context
} from 'aws-lambda';
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
): middy.MiddlewareObject<APIGatewayProxyEventV2, APIGatewayProxyResultV2> => {
  return {
    after: (
      handler: HandlerLambda<APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context>,
      next: NextFunction
    ): void => {
      const proxyResultResponse: APIGatewayProxyResultV2 = <APIGatewayProxyEventV2>handler.response;
      proxyResultResponse.headers = appendHeaders(proxyResultResponse.headers, config.headers);
      next();
    },
    onError: (
      handler: HandlerLambda<APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context>,
      next: NextFunction
    ): void => {
      const proxyResultResponse: APIGatewayProxyResultV2 = <APIGatewayProxyEventV2>handler.response;
      proxyResultResponse.headers = appendHeaders(proxyResultResponse.headers, config.headers);
      next();
    }
  };
};
