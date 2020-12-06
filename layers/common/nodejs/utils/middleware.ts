import { NextFunction, PayloadResponse, RateRequest } from './common-constants';
import { LambdaLogger } from './lambda-logger';
import { loggerMessages, mdcKey, SubLogger } from './log-constants';
import middy from '@middy/core';
import { Logger } from 'lambda-logger-node';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import HandlerLambda = middy.HandlerLambda;

type PayloadRequest = RateRequest;

const lambdaLoggerHandler = (
  log: LambdaLogger
): middy.MiddlewareObject<PayloadRequest, PayloadResponse> => {
  const startTime: [number, number] = process.hrtime();
  const subLog: Logger = log.createSubLogger(SubLogger.Lambda);

  return {
    before: (
      handler: HandlerLambda<PayloadRequest, PayloadResponse, Context>,
      next: NextFunction
    ): void => {
      log.setKeyIfPresent(mdcKey.requestBody, handler.event).setOnBeforeMdcKeys(handler.context);
      subLog.info(loggerMessages.start);
      next();
    },
    after: (
      handler: HandlerLambda<PayloadRequest, PayloadResponse, Context>,
      next: NextFunction
    ): void => {
      log.setOnAfterMdcKeys(handler.response, handler.response.statusCode, startTime);
      subLog.info(loggerMessages.complete);
      next();
    }
  };
};

const apiGatewayLoggerHandler = (
  log: LambdaLogger
): middy.MiddlewareObject<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const startTime: [number, number] = process.hrtime();
  const subLog: Logger = log.createSubLogger(SubLogger.Gateway);

  return {
    before: (
      handler: HandlerLambda<APIGatewayProxyEvent, APIGatewayProxyResult, Context>,
      next: NextFunction
    ): void => {
      log
        .setKey(mdcKey.requestMethod, handler.event.httpMethod)
        .setKey(mdcKey.requestPath, handler.event.path)
        .setKeyIfPresent(mdcKey.requestBody, handler.event.body)
        .setOnBeforeMdcKeys(handler.context);
      subLog.info(loggerMessages.start);
      next();
    },
    after: (
      handler: HandlerLambda<APIGatewayProxyEvent, APIGatewayProxyResult, Context>,
      next: NextFunction
    ): void => {
      log.setOnAfterMdcKeys(handler.response, handler.response.statusCode, startTime);
      subLog.info(loggerMessages.complete);
      next();
    }
  };
};

export const middleware = {
  lambdaLoggerHandler: lambdaLoggerHandler,
  apiGatewayLoggerHandler: apiGatewayLoggerHandler
};
