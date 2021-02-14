import { SamLogger } from './sam-logger';
import { loggerMessages, mdcKeys, SubLogger } from './log-constants';
import middy from '@middy/core';
import { Logger } from 'lambda-logger-node';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';
import { PayloadRequest, PayloadResponse } from '../models/invoker/payload';
import { NextFunction } from '../types/next';
import { commonUtils } from '../utils/common-utils';
import { match, Predicate } from '../utils/match';
import { Merge } from '../types/match';
import { HttpError } from 'http-errors';
import HandlerLambda = middy.HandlerLambda;

export type APIGatewayPostEvent<Body> = Merge<
  APIGatewayProxyEventV2,
  {
    body: Body;
  }
>;

export type APIGatewayGetEvent<PathParameters> = Merge<
  APIGatewayProxyEventV2,
  {
    pathParameters?: PathParameters;
  }
>;

export type APIGatewayEvent<T = any, U = any> = APIGatewayPostEvent<T> | APIGatewayGetEvent<U>;
export type APIGatewayResult = APIGatewayProxyStructuredResultV2 | HttpError;
export type EventRequest<T = any, U = any> = APIGatewayEvent<T> | PayloadRequest<U>;
export type EventResponse<T = any> = APIGatewayProxyStructuredResultV2 | PayloadResponse<T>;

export const enum LoggerMode {
  Gateway,
  Lambda,
  VoidLambda
}

interface LambdaLoggerConfig {
  logger: SamLogger;
  mode: LoggerMode;
}

const isControllerMode: Predicate<LoggerMode> = (m: LoggerMode) => m == LoggerMode.Gateway;
const isLambdaMode: Predicate<LoggerMode> = (m: LoggerMode) => m == LoggerMode.Lambda;

export const eventLogger = (config: LambdaLoggerConfig): middy.MiddlewareObject<EventRequest, EventResponse> => {
  const logger: SamLogger = config.logger;
  const startTime: [number, number] = process.hrtime();
  const subLogger: Logger = logger.createSubLogger(SubLogger.LAMBDA);

  const logController: middy.MiddlewareObject<APIGatewayEvent, APIGatewayResult> = {
    before: (handler: HandlerLambda, next: NextFunction): void => {
      const proxyEventRequest = handler.event;
      let traceIndex = 0;
      logger
        .setKey(mdcKeys.requestMethod, proxyEventRequest.requestContext.http.method)
        .setKey(mdcKeys.requestPath, proxyEventRequest.requestContext.http.path)
        .setKey(mdcKeys.sourceIp, proxyEventRequest.requestContext.http.sourceIp)
        .setKey(mdcKeys.date, commonUtils.getFormattedDate)
        .setKey(mdcKeys.appName, handler.context.functionName)
        .setKey(mdcKeys.version, handler.context.functionVersion)
        .setKey(mdcKeys.traceIndex, () => traceIndex++)
        .setKeyIfPresent(mdcKeys.requestBody, proxyEventRequest.body);
      subLogger.info(loggerMessages.started);
      next();
    },
    after: (handler: HandlerLambda, next: NextFunction): void => {
      const proxyResultResponse: APIGatewayProxyStructuredResultV2 = handler.response;
      logger
        .setKey(mdcKeys.responseBody, proxyResultResponse.body)
        .setKey(mdcKeys.elapsedTime, commonUtils.getElapsedTime(startTime))
        .setKeyIfPresent(mdcKeys.responseStatusCode, proxyResultResponse.statusCode);
      subLogger.info(loggerMessages.completed);
      next();
    },
    onError: (handler: HandlerLambda, next: NextFunction): void => {
      logger.setOnErrorMdcKeys(handler.error);
      subLogger.error(loggerMessages.failed);
      next();
    }
  };

  const logLambda: middy.MiddlewareObject<PayloadRequest<any>, PayloadResponse<any>> = {
    before: (handler: HandlerLambda, next: NextFunction): void => {
      const context: Context = handler.context;
      let traceIndex = 0;
      logger
        .setKeyIfPresent(mdcKeys.requestBody, handler.event)
        .setKey(mdcKeys.traceId, context.awsRequestId)
        .setKey(mdcKeys.appName, context.functionName)
        .setKey(mdcKeys.version, context.functionVersion)
        .setKey(mdcKeys.date, commonUtils.getFormattedDate)
        .setKey(mdcKeys.traceIndex, () => traceIndex++);
      subLogger.info(loggerMessages.started);
      next();
    },
    after: (handler: HandlerLambda, next: NextFunction): void => {
      const payloadResponse: PayloadResponse<any> = handler.event;
      logger
        .setKey(mdcKeys.responseBody, payloadResponse.body)
        .setKey(mdcKeys.elapsedTime, commonUtils.getElapsedTime(startTime))
        .setKeyIfPresent(mdcKeys.responseStatusCode, payloadResponse.statusCode);
      subLogger.info(loggerMessages.completed);
      next();
    },
    onError: (handler: HandlerLambda, next: NextFunction): void => {
      logger.setOnErrorMdcKeys(handler.error);
      subLogger.error(loggerMessages.failed);
      next();
    }
  };

  return match(config.mode)
    .on(isControllerMode, () => logController)
    .on(isLambdaMode, () => logLambda)
    .otherwise(() => {
      throw new Error('FIX LOGGER ERROR');
    });
};
