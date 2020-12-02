import { Logger } from 'lambda-logger-node';
import { NextFunction } from 'express';
import { mdcKey, loggerMessages, subLogger } from './log-constants';
import { DbPayload } from './common-constants';
import { Context } from 'aws-lambda';
import { commonUtils } from './commonUtils';

interface ILogger extends Logger {
  info(message: any): void;

  debug(message: any): void;

  warn(message: any): void;

  error(message: any): void;

  setKey(key: string, value: any): void;

  handler(logContext: any): any;

  createSubLogger(contextPath: string): Logger;
}

class LambdaLoggerAbstract implements ILogger {
  private readonly _logger: Logger;

  protected constructor(options: any) {
    this._logger = new Logger(options);
  }

  public info(message: any): void {
    this._logger.info(message);
  }

  public debug(message: any): void {
    this._logger.debug(message);
  }

  public warn(message: any): void {
    this._logger.warn(message);
  }

  public error(message: any): void {
    this._logger(message);
  }

  public setKey(key: string, value: any): void {
    this._logger.setKey(key, value);
  }

  public handler(logContext: any): any {
    return this._logger.handler(logContext);
  }

  public createSubLogger(contextPath: string): Logger {
    return this._logger.createSubLogger(contextPath);
  }
}

export class LambdaLogger extends LambdaLoggerAbstract {
  public constructor(options: any) {
    super(options);
  }

  public setBeforeHandlerMdcKeys = (lambdaEvent: any, lambdaContext: Context): void => {
    let traceIndex = 0;

    super.setKey(mdcKey.traceId, lambdaContext.awsRequestId);
    super.setKey(mdcKey.date, commonUtils.getFormattedDate);
    super.setKey(mdcKey.appName, lambdaContext.functionName);
    super.setKey(mdcKey.version, lambdaContext.functionVersion);
    super.setKey(mdcKey.requestBody, lambdaEvent);
    super.setKey(mdcKey.traceIndex, () => traceIndex++);
    // super.setKey(
    //   'apigTraceId',
    //   (lambdaEvent && lambdaEvent.awsRequestId) ||
    //     (lambdaContext && lambdaContext.requestContext && lambdaContext.requestContext.requestId)
    // );
  };

  public setAfterHandlerMdcKeys = (
    responseBody: any,
    statusCode: number,
    startTime: [number, number]
  ): void => {
    super.setKey(mdcKey.requestBody, responseBody);
    super.setKey(mdcKey.responseStatusCode, statusCode);
    super.setKey(mdcKey.durationMs, commonUtils.getElapsedTime(startTime));
  };

  public setErrorMdcKeys = (error: Error): void => {
    super.setKey(mdcKey.errorName, error.name);
    super.setKey(mdcKey.errorMessage, error.message);
    super.setKey(mdcKey.errorStacktrace, error.stack);
  };
}

const buildLogger = (): LambdaLogger => {
  const logContext: LambdaLogger = new LambdaLogger({
    minimumLogLevel: 'DEBUG'
  });
  return logContext;
};

export const apiLogInterceptor = (log: LambdaLogger, req, res, next: NextFunction): void => {
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
    log.setKey(mdcKey.durationMs, commonUtils.getElapsedTime(startTime));
    log.setKey(mdcKey.responseBody, JSON.parse(Buffer.concat(chunks).toString('utf8')));
    subLog.info(loggerMessages.complete);
  });

  next();
};

export const dbLogWrapper = (log: LambdaLogger, fn: (params: any) => Promise<DbPayload>) => {
  return async (params: any): Promise<DbPayload> => {
    const startTime: [number, number] = process.hrtime();
    let response: any;
    const subLog: Logger = log.createSubLogger(subLogger.DATABASE);
    try {
      log.setKey(mdcKey.dbQuery, params);
      subLog.info(loggerMessages.start);
      response = await fn(params);
    } finally {
      log.setKey(mdcKey.dbDurationMs, commonUtils.getElapsedTime(startTime));
      log.setKey(mdcKey.dbResult, response);
      subLog.info(loggerMessages.complete);
    }
    return response;
  };
};

export const log: LambdaLogger = buildLogger();
