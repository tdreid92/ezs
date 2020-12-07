import { Lambda } from 'aws-sdk';
import {
  FunctionNamespace,
  Immutable,
  InvocationType,
  LogType,
  PayloadRequest,
  PayloadResponse
} from '../utils/common-constants';
import { log } from '../utils/lambda-logger';
import { Logger } from 'lambda-logger-node';
import { loggerMessages, mdcKey, SubLogger } from '../utils/log-constants';
import { commonUtils } from '../utils/commonUtils';

export interface InvokerOptions {
  functionName: FunctionNamespace;
  InvocationType?: InvocationType; //todo remove enum
  logType?: LogType; //todo remove enum
  qualifier?: Lambda.Qualifier;
}

/** Refer to https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html for more information. */
export class InvokerRequest {
  public functionName: Immutable<FunctionNamespace>;
  public payloadRequest?: Immutable<PayloadRequest>;
  public invocationType?: Immutable<InvocationType>;
  public logType?: Immutable<LogType>;
  public qualifier?: Immutable<Lambda.Qualifier>;

  constructor(options: InvokerOptions) {
    this.functionName = options.functionName;
    this.invocationType = options.InvocationType;
    this.logType = options.logType;
    this.qualifier = options.qualifier;
  }

  public setPayloadRequest = (payloadRequest: PayloadRequest): this => {
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

export class InvokerResponse {
  public statusCode?: Immutable<Lambda.Integer>;
  public executedVersion?: Immutable<string>;
  public functionError?: Immutable<string>;
  public logResult?: Immutable<Lambda.LogType>;
  public payloadResponse?: Immutable<PayloadResponse>;

  constructor(response: Lambda.InvocationResponse) {
    this.statusCode = response.StatusCode;
    this.executedVersion = response.ExecutedVersion;
    this.functionError = response.FunctionError;
    this.logResult = response.LogResult;
    this.payloadResponse = <PayloadResponse>response.Payload;
  }

  public toJSON = () => {
    return {
      StatusCode: this.statusCode,
      ExecutedVersion: this.executedVersion,
      FunctionError: this.functionError,
      LogResult: this.logResult,
      Payload: commonUtils.tryParse(this.payloadResponse)
    };
  };
}

export class Invoker extends InvokerRequest {
  private _response: InvokerResponse | undefined;
  private _lambda: Lambda;

  constructor(options: InvokerOptions) {
    super(options);
    this._lambda = new Lambda({
      region: process.env.AWS_REGION,
      endpoint: 'http://host.docker.internal:3001'
    });
    //todo add env config
    return this;
  }

  /** Response methods */
  getStatusCode = (): number | undefined => this._response?.statusCode;

  getExecutedVersion = (): string | undefined => this._response?.executedVersion;

  getFunctionError = (): string | undefined => this._response?.functionError;

  getLogResult = (): string | undefined => this._response?.logResult;

  getPayloadResponse = (): PayloadResponse | undefined => this._response?.payloadResponse;

  /** Invoker methods */
  async invoke(): Promise<InvokerResponse> {
    const subLog: Logger = log.createSubLogger(SubLogger.Invoker);

    log.setKey(mdcKey.invokerRequestBody, this.toJSON());
    subLog.info(loggerMessages.start);

    const request: Lambda.InvocationRequest = this.toInvocationRequest();
    const response: Lambda.InvocationResponse = await this._lambda.invoke(request).promise();

    this._response = new InvokerResponse(response);
    log.setKey(mdcKey.invokerResponseBody, this._response.toJSON());
    subLog.info(loggerMessages.complete);

    return this._response;
  }
}
