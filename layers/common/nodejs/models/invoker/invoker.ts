import { Lambda } from 'aws-sdk';
import { log } from '../../log/sam-logger';
import { Logger } from 'lambda-logger-node';
import { loggerMessages, mdcKeys, SubLogger } from '../../log/log-constants';
import { PayloadRequest, PayloadResponse } from './payload';
import { HttpError } from 'http-errors';
import { Immutable } from '../../types/immutable';

/**
 * See https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html
 * */
export interface InvokerConfiguration {
  functionName: string;
  invocationType?: InvocationType; //todo remove enum
  logType?: LogType; //todo remove enum
  qualifier?: Lambda.Qualifier;
  functionEndpoint?: string;
}

export const enum FunctionNamespace {
  GetTranslationController = 'GetTranslationController',
  UploadTranslationController = 'UploadTranslationController',
  RepositoryService = 'RepositoryService',
  PollySynthesizer = 'PollySynthesizer'
}

export const enum InvocationType {
  RequestResponse = 'RequestResponse',
  Event = 'Event',
  DryRun = 'DryRun'
}

export const enum LogType {
  None = 'None',
  Tail = 'Tail'
}

class InvokerRequest<T> {
  public functionName: Immutable<string>;
  public payloadRequest?: Immutable<PayloadRequest<any>>;
  public invocationType?: Immutable<InvocationType>;
  public logType?: Immutable<LogType>;
  public qualifier?: Immutable<Lambda.Qualifier>;
  protected _lambda: Lambda;

  constructor(options: InvokerConfiguration) {
    this.functionName = options.functionName;
    this.invocationType = options.invocationType;
    this.logType = options.logType;
    this.qualifier = options.qualifier;
    const config: Lambda.Types.ClientConfiguration = options.functionEndpoint
      ? {
          endpoint: options.functionEndpoint
        }
      : {};
    this._lambda = new Lambda(config);
  }

  public setPayloadRequest = (payloadRequest: PayloadRequest<T>): this => {
    this.payloadRequest = payloadRequest;
    return this;
  };

  public toJSON = () => {
    //todo cleaner impl somehow?
    return {
      FunctionName: this.functionName,
      Payload: this.payloadRequest,
      InvocationType: this.invocationType,
      LogType: this.logType,
      Qualifier: this.qualifier
    };
  };

  public toInvocationRequest = (): Lambda.InvocationRequest => {
    return {
      FunctionName: this.functionName,
      Payload: JSON.stringify(this.payloadRequest),
      InvocationType: this.invocationType,
      LogType: this.logType,
      Qualifier: this.qualifier
    };
  };
}

class InvokerResponse<Body> {
  public statusCode?: Immutable<Lambda.Integer>;
  public executedVersion?: Immutable<string>;
  public functionError?: Immutable<string>;
  public logResult?: Immutable<Lambda.LogType>;
  public payloadResponse?: PayloadResponse<Body> | undefined;

  constructor(response?: Lambda.InvocationResponse) {
    if (response) {
      this.statusCode = response.StatusCode;
      this.executedVersion = response.ExecutedVersion;
      this.functionError = response.FunctionError;
      this.logResult = response.LogResult;
      if (response.Payload && typeof response.Payload === 'string') {
        this.payloadResponse = <PayloadResponse<Body>>JSON.parse(response.Payload);
      } else {
        throw Error('Unexpected Lambda Response');
      }
    }
  }

  public toJSON = () => {
    return {
      StatusCode: this.statusCode,
      ExecutedVersion: this.executedVersion,
      FunctionError: this.functionError,
      LogResult: this.logResult,
      Payload: this.payloadResponse
    };
  };
}

export class Invoker<Request = any, Response = any> extends InvokerRequest<Request> {
  private _response: InvokerResponse<Response>;

  constructor(options: InvokerConfiguration) {
    super(options);
    this._response = new InvokerResponse<Response>();
    return this;
  }

  /** Response methods */
  getStatusCode = (): number | undefined => this._response?.statusCode;

  getExecutedVersion = (): string | undefined => this._response?.executedVersion;

  getFunctionError = (): string | undefined => this._response?.functionError;

  getLogResult = (): string | undefined => this._response?.logResult;

  getPayloadResponse = (): PayloadResponse<Response> | HttpError => this._response.payloadResponse!;

  /** Invoker methods */
  async invoke(): Promise<this> {
    const subLog: Logger = log.createSubLogger(SubLogger.INVOKER);

    log.setKey(mdcKeys.invokerRequestBody, this.toJSON());
    subLog.info(loggerMessages.started);

    const response: Lambda.InvocationResponse = await this._lambda.invoke(this.toInvocationRequest()).promise();
    this._response = new InvokerResponse(response);

    log.setKey(mdcKeys.invokerResponseBody, this._response.toJSON());
    subLog.info(loggerMessages.completed);

    return this;
  }
}
