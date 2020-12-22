import { SamLogger } from '../log/sam-logger';
import { loggerMessages, mdcKeys, SubLogger } from '../log/log-constants';
import middy from '@middy/core';
import { Logger } from 'lambda-logger-node';
import { Context } from 'aws-lambda';
import { PayloadRequest, ResponseEntity } from '../models/invoker/payload';
import { NextFunction } from '../types/next';
import HandlerLambda = middy.HandlerLambda;

interface LambdaLoggerConfig {
  logger: SamLogger;
}

export const lambdaLogger = (
  config: LambdaLoggerConfig
): middy.MiddlewareObject<PayloadRequest, ResponseEntity> => {
  const logger: SamLogger = config.logger;
  const startTime: [number, number] = process.hrtime();
  const subLogger: Logger = logger.createSubLogger(SubLogger.Lambda);

  return {
    before: (
      handler: HandlerLambda<PayloadRequest, ResponseEntity, Context>,
      next: NextFunction
    ): void => {
      logger
        .setKeyIfPresent(mdcKeys.requestBody, handler.event)
        .setOnBeforeMdcKeys(handler.context);
      subLogger.info(loggerMessages.start);
      next();
    },
    after: (
      handler: HandlerLambda<PayloadRequest, ResponseEntity, Context>,
      next: NextFunction
    ): void => {
      logger.setOnAfterMdcKeys(handler.response, handler.response.statusCode, startTime);
      subLogger.info(loggerMessages.complete);
      next();
    },
    onError: (
      handler: HandlerLambda<PayloadRequest, ResponseEntity, Context>,
      next: NextFunction
    ): void => {
      logger.setOnErrorMdcKeys(handler.error);
      subLogger.error(loggerMessages.failed);
      next();
    }
  };
};
