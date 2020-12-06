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

abstract class LoggerWrapper implements ILoggerWrapper {
  private readonly _logger: Logger;

  protected constructor(options: LoggerOptions) {
    this._logger = new Logger(options);
  }

  public debug = (message: any): void => this._logger.debug(message);

  public info = (message: any): void => this._logger.info(message);

  public warn = (message: any): void => this._logger.warn(message);

  public error = (message: any): void => this._logger(message);

  /** Overridable */
  public setKey(key: string, value: any): this {
    return this._logger.setKey(key, value);
  }

  public handler = (logContext: any): any => this._logger.handler(logContext);

  public createSubLogger = (contextPath: keyof typeof SubLogger): Logger =>
    this._logger.createSubLogger(contextPath);

  abstract setOnBeforeMdcKeys(...args: any): this;

  abstract setOnAfterMdcKeys(...args: any): this;

  abstract setOnErrorMdcKeys(error: Error): this;
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

  public setOnBeforeMdcKeys = (context: Context): this => {
    let traceIndex = 0;
    return this.setKey(mdcKey.traceId, context.awsRequestId)
      .setKey(mdcKey.date, commonUtils.getFormattedDate)
      .setKey(mdcKey.appName, context.functionName)
      .setKey(mdcKey.version, context.functionVersion)
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
  ): this =>
    this.setKey(mdcKey.responseBody, responseBody)
      .setKey(mdcKey.elapsedTime, commonUtils.getElapsedTime(startTime))
      .setKeyIfPresent(mdcKey.responseStatusCode, statusCode);

  public setOnErrorMdcKeys = (error: Error): this =>
    this.setKey(mdcKey.errorName, error.name)
      .setKey(mdcKey.errorMessage, error.message)
      .setKey(mdcKey.errorStacktrace, error.stack);
}

const buildLogger = (): LambdaLogger => {
  const logContext: LambdaLogger = new LambdaLogger({
    minimumLogLevel: MinimumLogLevel.Debug
  });
  return logContext;
};

export const dbLogWrapper = (log: LambdaLogger, fn: (params: any) => Promise<PayloadResponse>) => {
  return async (params: any): Promise<PayloadResponse> => {
    const startTime: [number, number] = process.hrtime();
    const subLog: Logger = log.createSubLogger(SubLogger.Database);

    log.setKey(mdcKey.databaseQuery, params);
    subLog.info(loggerMessages.start);

    return await fn(params)
      .then((response: PayloadResponse) => {
        log.setKey(mdcKey.databaseResult, response);
        subLog.info(loggerMessages.complete);
        return response;
      })
      .catch((error: Error) => {
        log.setOnErrorMdcKeys(error);
        subLog.info(loggerMessages.failed);
        throw error;
      })
      .finally(() => log.setKey(mdcKey.databaseElapsedTime, commonUtils.getElapsedTime(startTime)));
  };
};

export const log: LambdaLogger = buildLogger();
