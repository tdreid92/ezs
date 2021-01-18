import { SamLogger } from '../log/sam-logger';
import { loggerMessages, mdcKeys, SubLogger } from '../log/log-constants';
import middy from '@middy/core';
import { Logger } from 'lambda-logger-node';
import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';
import { PayloadResponse } from '../models/invoker/payload';
import { NextFunction } from '../types/next';
import { commonUtils } from '../utils/common-utils';
import HandlerLambda = middy.HandlerLambda;

export const enum LoggerMode {
  Controller,
  Lambda
}

interface LambdaLoggerConfig {
  logger: SamLogger;
  mode: LoggerMode;
}

export const lambdaLogger = (config: LambdaLoggerConfig): middy.MiddlewareObject<APIGatewayEvent, PayloadResponse> => {
  const logger: SamLogger = config.logger;
  const startTime: [number, number] = process.hrtime();
  const subLogger: Logger = logger.createSubLogger(SubLogger.LAMBDA);

  if (config.mode == LoggerMode.Controller) {
    return {
      before: (handler: HandlerLambda<APIGatewayProxyEvent, PayloadResponse, Context>, next: NextFunction): void => {
        logger.info(handler.event);
        logger
          .setKey(mdcKeys.requestMethod, handler.event.httpMethod)
          .setKey(mdcKeys.requestPath, handler.event.path)
          .setKeyIfPresent(mdcKeys.requestBody, commonUtils.tryParse(handler.event.body))
          .setOnBeforeMdcKeys(handler.context);
        subLogger.info(loggerMessages.start);
        next();
      },
      after: (handler: HandlerLambda<APIGatewayProxyEvent, PayloadResponse, Context>, next: NextFunction): void => {
        //todo find best way to remove headers from response optionally
        logger.setOnAfterMdcKeys(
          'hi',
          (<APIGatewayProxyStructuredResultV2>(<unknown>handler.response)).statusCode,
          startTime
        );
        subLogger.info(loggerMessages.complete);
        next();
      },
      onError: (handler: HandlerLambda<APIGatewayProxyEvent, PayloadResponse, Context>, next: NextFunction): void => {
        logger.setOnErrorMdcKeys(handler.error);
        subLogger.error(loggerMessages.failed);
        next();
      }
    };
  }

  return {
    before: (handler: HandlerLambda<APIGatewayEvent, PayloadResponse, Context>, next: NextFunction): void => {
      logger.setKeyIfPresent(mdcKeys.requestBody, handler.event).setOnBeforeMdcKeys(handler.context);
      subLogger.info(loggerMessages.start);
      next();
    },
    after: (handler: HandlerLambda<APIGatewayEvent, PayloadResponse, Context>, next: NextFunction): void => {
      logger.setOnAfterMdcKeys(handler.response, 200, startTime);
      subLogger.info(loggerMessages.complete);
      next();
    },
    onError: (handler: HandlerLambda<APIGatewayEvent, PayloadResponse, Context>, next: NextFunction): void => {
      logger.setOnErrorMdcKeys(handler.error);
      subLogger.error(loggerMessages.failed);
      next();
    }
  };
};
