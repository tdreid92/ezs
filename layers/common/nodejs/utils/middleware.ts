import { NextFunction, PayloadRequest, PayloadResponse } from './common-constants';
import { LambdaLogger } from './lambda-logger';
import { loggerMessages, mdcKey, SubLogger } from './log-constants';
import middy from '@middy/core';
import { Logger } from 'lambda-logger-node';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import HandlerLambda = middy.HandlerLambda;
import { commonUtils } from './commonUtils';

const requestResponseLogger = (
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

const gatewayLogger = (
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
        .setKeyIfPresent(mdcKey.requestBody, commonUtils.tryParse(handler.event.body))
        .setOnBeforeMdcKeys(handler.context);
      subLog.info(loggerMessages.start);
      next();
    },
    after: (
      handler: HandlerLambda<APIGatewayProxyEvent, APIGatewayProxyResult, Context>,
      next: NextFunction
    ): void => {
      //todo find best way to remove headers from response optionally
      log.setOnAfterMdcKeys(handler.response, handler.response.statusCode, startTime);
      subLog.info(loggerMessages.complete);
      next();
    }
  };
};

//const databaseCheck() => {
//
// }

export const middleware = {
  requestResponseLogger: requestResponseLogger,
  gatewayLogger: gatewayLogger
  // databaseCheck: databaseCheck,
};
