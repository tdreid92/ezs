import { Logger } from 'lambda-logger-node';
import { NextFunction } from 'express';
import { logConsts } from './log-constants';

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
  const startTime: [number, number] = process.hrtime();

  log.setKey(logConsts.requestMethod, req.method);
  log.setKey(logConsts.requestUrl, req.url);
  log.setKey(logConsts.requestBody, req.body);
  log.info('Request started for API');

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
    log.setKey(logConsts.durationMs, getElapsedTime(startTime));
    log.setKey(logConsts.responseBody, JSON.parse(Buffer.concat(chunks).toString('utf8')));
    log.info('Request completed for API');
  });

  next();
};

export const logInterceptor = (fn: (...args: any[]) => any) => {
  return async (...args: any[]) => {
    const startTime: [number, number] = process.hrtime();
    let response: any;
    try {
      log.setKey(logConsts.requestBody, args[0]);
      log.info('Request started for lambda');
      response = await fn(...args);
    } finally {
      log.setKey(logConsts.durationMs, getElapsedTime(startTime));
      log.setKey(logConsts.requestBody, response);
      log.info('Request completed for lambda');
    }
    return response;
  };
};

export const log: Logger = buildLogger();
