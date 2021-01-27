import { SamLogger } from '../log/sam-logger';
import { loggerMessages, mdcKeys, SubLogger } from '../log/log-constants';
import middy from '@middy/core';
import { Logger } from 'lambda-logger-node';
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
  Context
} from 'aws-lambda';
import { PayloadRequest, PayloadResponse } from '../models/invoker/payload';
import { NextFunction } from '../types/next';
import { commonUtils } from '../utils/common-utils';
import { match, Predicate } from '../types/match';
import HandlerLambda = middy.HandlerLambda;
import { DatabaseRequest } from '../models/database-request';

export const enum LoggerMode {
  Controller,
  Lambda,
  VoidLambda
}

interface LambdaLoggerConfig {
  logger: SamLogger;
  mode: LoggerMode;
}

const isControllerMode: Predicate<LoggerMode> = (m: LoggerMode) => m == LoggerMode.Controller;
const isLambdaMode: Predicate<LoggerMode> = (m: LoggerMode) => m == LoggerMode.Lambda;
const isVoidLambdaMode: Predicate<LoggerMode> = (m: LoggerMode) => m == LoggerMode.VoidLambda;

/**
 * Remove type T from type U
 *
 * Author: stackoverflow.com/users/985454/qwerty
 */
type Omit<T, U extends keyof T> = Pick<T, Exclude<keyof T, U>>;

/**
 * Override type N that are assignable to type M with N
 *
 * Author: stackoverflow.com/users/985454/qwerty
 */
type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;

export type GatewayEvent<T> = Merge<
  APIGatewayProxyEventV2,
  {
    body: T;
  }
>;

export type EventRequest<T = any, U = any> = GatewayEvent<T> | PayloadRequest<U>;
export type EventResponse<T = any, M = any> = GatewayEvent<T> | PayloadResponse<M> | void;

export const eventLogger = (config: LambdaLoggerConfig): middy.MiddlewareObject<EventRequest, EventResponse> => {
  const logger: SamLogger = config.logger;
  const startTime: [number, number] = process.hrtime();
  const subLogger: Logger = logger.createSubLogger(SubLogger.LAMBDA);

  const logController: middy.MiddlewareObject<GatewayEvent<any>, APIGatewayProxyResultV2> = {
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

  const logLambda: middy.MiddlewareObject<PayloadRequest, PayloadResponse> = {
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
      const payloadResponse: PayloadResponse = handler.event;
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

  // const logVoidLambda: middy.MiddlewareObject<PayloadRequest, void> = {
  //   before: (handler: HandlerLambda, next: NextFunction): void => {
  //     const context: Context = handler.context;
  //     let traceIndex = 0;
  //     logger
  //       .setKeyIfPresent(mdcKeys.requestBody, handler.event)
  //       .setKey(mdcKeys.traceId, context.awsRequestId)
  //       .setKey(mdcKeys.appName, context.functionName)
  //       .setKey(mdcKeys.version, context.functionVersion)
  //       .setKey(mdcKeys.date, commonUtils.getFormattedDate)
  //       .setKey(mdcKeys.traceIndex, () => traceIndex++);
  //     subLogger.info(loggerMessages.started);
  //     next();
  //   },
  //   after: (handler: HandlerLambda, next: NextFunction): void => {
  //     const payloadResponse: PayloadResponse = handler.event;
  //     logger
  //       .setKey(mdcKeys.elapsedTime, commonUtils.getElapsedTime(startTime))
  //       .setKeyIfPresent(mdcKeys.responseStatusCode, payloadResponse.statusCode);
  //     subLogger.info(loggerMessages.completed);
  //     next();
  //   },
  //   onError: (handler: HandlerLambda, next: NextFunction): void => {
  //     logger.setOnErrorMdcKeys(handler.error);
  //     subLogger.error(loggerMessages.failed);
  //     next();
  //   }
  //};

  return (
    match(config.mode)
      .on(isControllerMode, () => logController)
      .on(isLambdaMode, () => logLambda)
      // .on(isVoidLambdaMode, () => logVoidLambda)
      .otherwise(() => {
        throw new Error('FIX LOGGER ERROR');
      })
  );
};
