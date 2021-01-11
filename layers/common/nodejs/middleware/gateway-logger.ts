import { SamLogger } from '../log/sam-logger';
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { loggerMessages, mdcKeys, SubLogger } from '../log/log-constants';
import { NextFunction } from '../types/next';
import { commonUtils } from '../utils/common-utils';
import { Logger } from 'lambda-logger-node';
import HandlerLambda = middy.HandlerLambda;

interface GatewayLoggerConfig {
  logger: SamLogger;
}

export const gatewayLogger = (
  config: GatewayLoggerConfig
): middy.MiddlewareObject<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const logger: SamLogger = config.logger;
  const startTime: [number, number] = process.hrtime();
  const subLogger: Logger = logger.createSubLogger(SubLogger.GATEWAY);

  return {
    before: (
      handler: HandlerLambda<APIGatewayProxyEvent, APIGatewayProxyResult, Context>,
      next: NextFunction
    ): void => {
      logger
        .setKey(mdcKeys.requestMethod, handler.event.httpMethod)
        .setKey(mdcKeys.requestPath, handler.event.path)
        .setKeyIfPresent(mdcKeys.requestBody, commonUtils.tryParse(handler.event.body))
        .setOnBeforeMdcKeys(handler.context);
      subLogger.info(loggerMessages.start);
      next();
    },
    after: (handler: HandlerLambda<APIGatewayProxyEvent, APIGatewayProxyResult, Context>, next: NextFunction): void => {
      //todo find best way to remove headers from response optionally
      logger.setOnAfterMdcKeys(JSON.parse(handler.response.body), handler.response.statusCode, startTime);
      if (process.env.NODE_ENV == 'development') {
        logger.setKeyIfPresent(mdcKeys.responseHeaders, handler.response.headers);
      }
      subLogger.info(loggerMessages.complete);
      next();
    },
    onError: (
      handler: HandlerLambda<APIGatewayProxyEvent, APIGatewayProxyResult, Context>,
      next: NextFunction
    ): void => {
      logger.setOnErrorMdcKeys(handler.error);
      subLogger.error(loggerMessages.failed);
      next();
    }
  };
};
