import { LambdaLogger } from '../log/lambda-logger';
import { loggerMessages, mdcKeys, SubLogger } from '../log/log-constants';
import middy from '@middy/core';
import { Logger } from 'lambda-logger-node';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { commonUtils } from '../utils/common-utils';
import { PayloadRequest, PayloadResponse } from '../models/invoker/payload';
import { NextFunction } from '../types/next';
import HandlerLambda = middy.HandlerLambda;

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
      log.setKeyIfPresent(mdcKeys.requestBody, handler.event).setOnBeforeMdcKeys(handler.context);
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
        .setKey(mdcKeys.requestMethod, handler.event.httpMethod)
        .setKey(mdcKeys.requestPath, handler.event.path)
        .setKeyIfPresent(mdcKeys.requestBody, commonUtils.tryParse(handler.event.body))
        .setOnBeforeMdcKeys(handler.context);
      subLog.info(loggerMessages.start);
      next();
    },
    after: (
      handler: HandlerLambda<APIGatewayProxyEvent, APIGatewayProxyResult, Context>,
      next: NextFunction
    ): void => {
      //todo find best way to remove headers from response optionally
      log.setOnAfterMdcKeys(
        JSON.parse(handler.response.body),
        handler.response.statusCode,
        startTime
      );
      if (process.env.NODE_ENV == 'development') {
        log.setKeyIfPresent(mdcKeys.responseHeaders, handler.response.headers);
      }
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
