import { Logger } from 'lambda-logger-node';
import { NextFunction } from 'express';
import { loggerKeys, loggerMessages, subLogger } from './log-constants';

// export class MyLogger extends Logger {
//   getAPISubLogger
// }
const buildLogger = (): Logger => {
  const log: Logger = new Logger({
    minimumLogLevel: 'DEBUG'
  });
  return log;
};

const getElapsedTime = (startTime: [number, number]): number => {
  const elapsedHrTime = process.hrtime(startTime);
  return elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
};

export const apiLogInterceptor = (req, res, next: NextFunction): void => {
  log.setKey(loggerKeys.requestMethod, req.method);
  log.setKey(loggerKeys.requestPath, req.url);
  log.setKey(loggerKeys.requestBody, req.body);

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
    log.setKey(loggerKeys.durationMs, getElapsedTime(startTime));
    log.setKey(loggerKeys.responseBody, JSON.parse(Buffer.concat(chunks).toString('utf8')));
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
      log.setKey(loggerKeys.requestBody, args[0]);
      subLog.info(loggerMessages.start);
      response = await fn(...args);
    } finally {
      log.setKey(loggerKeys.durationMs, getElapsedTime(startTime));
      log.setKey(loggerKeys.requestBody, response);
      subLog.info(loggerMessages.complete);
    }
    return response;
  };
};

export const dbLogWrapper = (fn: (...args: any[]) => any) => {
  return async (...args: any[]) => {
    const startTime: [number, number] = process.hrtime();
    let response: any;
    log.setKey(loggerKeys.dbQuery, args[0]);
    const subLog: Logger = log.createSubLogger(subLogger.DATABASE);
    try {
      log.setKey(loggerKeys.dbQuery, args[0]);
      subLog.info(loggerMessages.start);
      response = await fn(...args);
    } finally {
      log.setKey(loggerKeys.dbDurationMs, getElapsedTime(startTime));
      log.setKey(loggerKeys.dbResult, response);
      subLog.info(loggerMessages.complete);
    }
    return response;
  };
};

export const log: Logger = buildLogger();
