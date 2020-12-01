import { Logger } from 'lambda-logger-node';
import { NextFunction } from 'express';
import { mdcKey, loggerMessages, subLogger } from './log-constants';
import { DbPayload } from './common-constants';
import { Context } from 'aws-lambda';
import { commonUtils } from './commonUtils';

const buildLogger = (): Logger => {
  const logContext: Logger = new Logger({
    minimumLogLevel: 'DEBUG'
  });
  return logContext;
};

const getElapsedTime = (startTime: [number, number]): number => {
  const elapsedHrTime = process.hrtime(startTime);
  return elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
};

export const setMdcKeys = (logContext: Logger, lambdaEvent: any, lambdaContext: Context): void => {
  let traceIndex = 0;

  logContext.setKey(mdcKey.traceId, lambdaContext.awsRequestId);
  logContext.setKey(mdcKey.date, commonUtils.getFormattedDate);
  logContext.setKey(mdcKey.appName, lambdaContext.functionName);
  logContext.setKey(mdcKey.version, lambdaContext.functionVersion);
  logContext.setKey(mdcKey.requestBody, lambdaEvent);
  logContext.setKey(mdcKey.traceIndex, () => traceIndex++);
  // logContext.setKey(
  //   'apigTraceId',
  //   (lambdaEvent && lambdaEvent.awsRequestId) ||
  //     (lambdaContext && lambdaContext.requestContext && lambdaContext.requestContext.requestId)
  // );
};

export const apiLogInterceptor = (req, res, next: NextFunction): void => {
  log.setKey(mdcKey.requestMethod, req.method);
  log.setKey(mdcKey.requestPath, req.url);
  log.setKey(mdcKey.requestBody, req.body);

  const subLog: Logger = log.createSubLogger(subLogger.API);
  subLog.info(loggerMessages.start);

  const startTime: [number, number] = process.hrtime();
  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks: Buffer[] = [];

  res.write = (...restArgs: (ArrayBuffer | SharedArrayBuffer)[]) => {
    chunks.push(Buffer.from(restArgs[0]));
    oldWrite.apply(res, restArgs);
  };

  res.end = (...restArgs) => {
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]));
    }
    oldEnd.apply(res, restArgs);
  };

  res.on('finish', () => {
    log.setKey(mdcKey.durationMs, getElapsedTime(startTime));
    log.setKey(mdcKey.responseBody, JSON.parse(Buffer.concat(chunks).toString('utf8')));
    subLog.info(loggerMessages.complete);
  });

  next();
};

export const logWrapper = (fn: (...args: any[]) => any) => {
  return async (...args: any[]) => {
    const startTime: [number, number] = process.hrtime();
    let response: any;
    const subLog: Logger = log.createSubLogger(subLogger.LAMBDA);
    try {
      log.setKey(mdcKey.requestBody, args[0]);
      subLog.info(loggerMessages.start);
      response = await fn(...args);
    } finally {
      log.setKey(mdcKey.durationMs, getElapsedTime(startTime));
      log.setKey(mdcKey.requestBody, response);
      subLog.info(loggerMessages.complete);
    }
    return response;
  };
};

export const dbLogWrapper = (fn: (params: any) => Promise<DbPayload>) => {
  return async (params: any): Promise<DbPayload> => {
    const startTime: [number, number] = process.hrtime();
    let response: any;
    const subLog: Logger = log.createSubLogger(subLogger.DATABASE);
    try {
      log.setKey(mdcKey.dbQuery, params);
      subLog.info(loggerMessages.start);
      response = await fn(params);
    } finally {
      log.setKey(mdcKey.dbDurationMs, getElapsedTime(startTime));
      log.setKey(mdcKey.dbResult, response);
      subLog.info(loggerMessages.complete);
    }
    return response;
  };
};

export const log: Logger = buildLogger();
