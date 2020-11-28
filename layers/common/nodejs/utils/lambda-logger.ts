import { Logger } from 'lambda-logger-node';
import { NextFunction } from 'express';

const buildLogger = (): Logger => {
  const log: Logger = new Logger({
    minimumLogLevel: 'DEBUG'
  });
  return log;
};

export const apiLoggingInterceptor = (req, res, next: NextFunction): void => {
  const startHrTime = process.hrtime();
  log.setKey('request.method', req.method);
  log.setKey('request.url', req.url);
  log.setKey('request.body', req.body);
  log.info('Request started for API');

  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks: Buffer[] = [];

  res.write = (...restArgs) => {
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
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
    log.setKey('duration_ms', elapsedTimeInMs);
    log.setKey('response.body', JSON.parse(Buffer.concat(chunks).toString('utf8')));
    log.info('Request completed for API');
  });

  next();
};

export const log: Logger = buildLogger();
