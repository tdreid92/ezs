import { DbPayload, Next, RateRequest } from './common-constants';
import { LambdaLogger } from './lambda-logger';
import { loggerMessages, subLogger } from './log-constants';
import middy from '@middy/core';
import { Logger } from 'lambda-logger-node';
import MiddlewareObject = middy.MiddlewareObject;
import HandlerLambda = middy.HandlerLambda;

const loggingHandler = (logContext: LambdaLogger): MiddlewareObject<RateRequest, DbPayload> => {
  const startTime: [number, number] = process.hrtime();
  const subLog: Logger = logContext.createSubLogger(subLogger.LAMBDA);
  return {
    before: (handler: HandlerLambda, next: Next): void => {
      logContext.setBeforeHandlerMdcKeys(handler.event, handler.context);
      subLog.info(loggerMessages.start);
      next();
    },
    after: (handler: HandlerLambda, next: Next): void => {
      logContext.setAfterHandlerMdcKeys(handler.response, handler.response.statusCode, startTime);
      subLog.info(loggerMessages.complete);
      next();
    },
    onError: (handler: HandlerLambda, next: Next): void => {
      logContext.setAfterHandlerMdcKeys(handler.response, handler.response.statusCode, startTime);
      logContext.setErrorMdcKeys(handler.error);
      subLog.error(handler.error);
      subLog.error(loggerMessages.failed);
      next();
    }
  };
};

export const middleware = {
  loggingHandler: loggingHandler
};
