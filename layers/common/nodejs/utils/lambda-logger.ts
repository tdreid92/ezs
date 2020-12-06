import { Logger } from 'lambda-logger-node';
import { mdcKey, loggerMessages, SubLogger } from './log-constants';
import { PayloadResponse } from './common-constants';
import { Context } from 'aws-lambda';
import { commonUtils } from './commonUtils';

const enum MinimumLogLevel {
  Debug = 'DEBUG',
  Info = 'INFO',
  Warn = 'WARN',
  Error = 'ERROR'
}

interface LoggerOptions {
  minimumLogLevel?: MinimumLogLevel;
  formatter?: boolean;
  useBearerRedactor?: boolean;
  useGlobalErrorHandler?: boolean;
  forceGlobalErrorHandler?: boolean;
  redactors?: any;
  testMode?: boolean;
}

interface ILoggerWrapper extends Logger {
  debug(message: any): void;

  info(message: any): void;

  warn(message: any): void;

  error(message: any): void;

  setKey(key: string, value: any): this;

  handler(logContext: any): any;

  createSubLogger(contextPath: string): Logger;
}

class LoggerWrapper implements ILoggerWrapper {
  private readonly _logger: Logger;

  protected constructor(options: LoggerOptions) {
    this._logger = new Logger(options);
  }

  public debug(message: any): void {
    this._logger.debug(message);
  }

  public info(message: any): void {
    this._logger.info(message);
  }

  public warn(message: any): void {
    this._logger.warn(message);
  }

  public error(message: any): void {
    this._logger(message);
  }

  public setKey(key: string, value: any): this {
    return this._logger.setKey(key, value);
  }

  public handler(logContext: any): any {
    return this._logger.handler(logContext);
  }

  public createSubLogger(contextPath: keyof typeof SubLogger): Logger {
    return this._logger.createSubLogger(contextPath);
  }
}

export class LambdaLogger extends LoggerWrapper {
  public constructor(options: LoggerOptions) {
    super(options);
  }

  public setKey = (key: string, value: any): this => {
    super.setKey(key, value);
    return this;
  };

  public setKeyIfPresent = (key: string, value: any): this => {
    return value ? this.setKey(key, value) : this;
  };

  public setOnBeforeMdcKeys = (lambdaContext: Context): void => {
    let traceIndex = 0;
    this.setKey(mdcKey.traceId, lambdaContext.awsRequestId)
      .setKey(mdcKey.date, commonUtils.getFormattedDate)
      .setKey(mdcKey.appName, lambdaContext.functionName)
      .setKey(mdcKey.version, lambdaContext.functionVersion)
      .setKey(mdcKey.traceIndex, () => traceIndex++);
    // super.setKey(
    //   'apigTraceId',
    //   (lambdaEvent && lambdaEvent.awsRequestId) ||
    //     (lambdaContext && lambdaContext.requestContext && lambdaContext.requestContext.requestId)
    // );
  };

  public setOnAfterMdcKeys = (
    responseBody: any,
    statusCode: number,
    startTime: [number, number]
  ): void => {
    this.setKey(mdcKey.requestBody, responseBody)
      .setKey(mdcKey.responseStatusCode, statusCode)
      .setKey(mdcKey.durationMs, commonUtils.getElapsedTime(startTime));
  };

  public setErrorMdcKeys = (error: Error): void => {
    this.setKey(mdcKey.errorName, error.name)
      .setKey(mdcKey.errorMessage, error.message)
      .setKey(mdcKey.errorStacktrace, error.stack);
  };
}

const buildLogger = (): LambdaLogger => {
  const logContext: LambdaLogger = new LambdaLogger({
    minimumLogLevel: MinimumLogLevel.Debug
  });
  return logContext;
};

// export const apiLogInterceptor = (log: LambdaLogger, req, res, next: NextFunction): void => {
//   log.setKey(mdcKey.requestMethod, req.method);
//   log.setKey(mdcKey.requestPath, req.url);
//   log.setKey(mdcKey.requestBody, req.body);
//
//   const subLog: Logger = log.createSubLogger(subLogger.API);
//   subLog.info(loggerMessages.start);
//
//   const startTime: [number, number] = process.hrtime();
//   const oldWrite = res.write;
//   const oldEnd = res.end;
//   const chunks: Buffer[] = [];
//
//   res.write = (...restArgs: (ArrayBuffer | SharedArrayBuffer)[]) => {
//     chunks.push(Buffer.from(restArgs[0]));
//     oldWrite.apply(res, restArgs);
//   };
//
//   res.end = (...restArgs) => {
//     if (restArgs[0]) {
//       chunks.push(Buffer.from(restArgs[0]));
//     }
//     oldEnd.apply(res, restArgs);
//   };
//
//   res.on('finish', () => {
//     log.setKey(mdcKey.durationMs, commonUtils.getElapsedTime(startTime));
//     log.setKey(mdcKey.responseBody, JSON.parse(Buffer.concat(chunks).toString('utf8')));
//     subLog.info(loggerMessages.complete);
//   });
//
//   next();
// };

export const dbLogWrapper = (log: LambdaLogger, fn: (params: any) => Promise<PayloadResponse>) => {
  return async (params: any): Promise<PayloadResponse> => {
    const startTime: [number, number] = process.hrtime();
    let response: any;
    const subLog: Logger = log.createSubLogger(SubLogger.Database);
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
