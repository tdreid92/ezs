import { Logger } from 'lambda-logger-node';
import { loggerMessages, mdcKeys, SubLogger } from './log-constants';
import { Context } from 'aws-lambda';
import { commonUtils } from '../utils/common-utils';
import { ResponseEntity } from '../models/invoker/payload';

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

export class SamLogger extends LoggerWrapper {
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
    return this.setKey(mdcKeys.traceId, context.awsRequestId)
      .setKey(mdcKeys.date, commonUtils.getFormattedDate)
      .setKey(mdcKeys.appName, context.functionName)
      .setKey(mdcKeys.version, context.functionVersion)
      .setKey(mdcKeys.traceIndex, () => traceIndex++);
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
    this.setKey(mdcKeys.responseBody, responseBody)
      .setKey(mdcKeys.elapsedTime, commonUtils.getElapsedTime(startTime))
      .setKeyIfPresent(mdcKeys.responseStatusCode, statusCode);

  public setOnErrorMdcKeys = (error: Error): this =>
    this.setKey(mdcKeys.errorName, error.name)
      .setKey(mdcKeys.errorMessage, error.message)
      .setKey(mdcKeys.errorStacktrace, error.stack);
}

const buildLogger = (): SamLogger => {
  const logContext: SamLogger = new SamLogger({
    minimumLogLevel: MinimumLogLevel.Debug
  });
  return logContext;
};

export const dbLogWrapper = (log: SamLogger, fn: (params: any) => Promise<ResponseEntity>) => {
  return async (params: any): Promise<ResponseEntity> => {
    const startTime: [number, number] = process.hrtime();
    const subLog: Logger = log.createSubLogger(SubLogger.DATABASE);

    log.setKey(mdcKeys.databaseQuery, params);
    subLog.info(loggerMessages.start);

    return await fn(params)
      .then((response: ResponseEntity) => {
        log.setKey(mdcKeys.databaseResult, response);
        subLog.info(loggerMessages.complete);
        return response;
      })
      .catch((error: Error) => {
        log.setOnErrorMdcKeys(error);
        subLog.info(loggerMessages.failed);
        throw error;
      })
      .finally(() =>
        log.setKey(mdcKeys.databaseElapsedTime, commonUtils.getElapsedTime(startTime))
      );
  };
};

export const log: SamLogger = buildLogger();
