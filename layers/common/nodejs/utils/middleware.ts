import { DbPayload, Next, RateRequest } from './common-constants';
import { setMdcKeys } from './lambda-logger';
import { loggerMessages, mdcKey, subLogger } from './log-constants';
import middy from '@middy/core';
import { Logger } from 'lambda-logger-node';
import { commonUtils } from './commonUtils';
import MiddlewareObject = middy.MiddlewareObject;
import HandlerLambda = middy.HandlerLambda;

const loggingHandler = (logContext: Logger): MiddlewareObject<RateRequest, DbPayload> => {
  const startTime: [number, number] = process.hrtime();
  const subLog: Logger = logContext.createSubLogger(subLogger.LAMBDA);
  return {
    before: (handler: HandlerLambda, next: Next): void => {
      setMdcKeys(logContext, handler.event, handler.context);
      subLog.info(loggerMessages.start);
      next();
    },
    after: (handler: HandlerLambda, next: Next): void => {
      logContext.setKey(mdcKey.responseBody, handler.response);
      logContext.setKey(mdcKey.responseStatusCode, handler.response.statusCode);
      logContext.setKey(mdcKey.durationMs, commonUtils.getElapsedTime(startTime));
      subLog.info(loggerMessages.complete);
      next();
    },
    onError: (handler: HandlerLambda, next: Next): void => {
      setMdcKeys(logContext, handler.event, handler.context);
      logContext.setKey(mdcKey.responseBody, handler.response);
      logContext.setKey(mdcKey.responseStatusCode, handler.response.statusCode);
      const error: Error = handler.error;
      logContext.setKey(mdcKey.errorName, error.name);
      logContext.setKey(mdcKey.errorMessage, error.message);
      logContext.setKey(mdcKey.errorStacktrace, error.stack);
      subLog.error(error);
      subLog.error(loggerMessages.failed);
      next();
    }
  };
};

export const middleware = {
  loggingHandler: loggingHandler
};
