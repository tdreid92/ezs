import AWS, { Endpoint } from 'aws-sdk';
import { InvocationRequest, InvocationResponse } from 'aws-sdk/clients/lambda';
import { FunctionNamespace, InvocationType, LogType } from '../utils/common-constants';
import { log } from '../utils/lambda-logger';
import { Logger } from 'lambda-logger-node';
import { loggerMessages, mdcKey, SubLogger } from '../utils/log-constants';

/** Refer to https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html for more information. */
class InvokerRequest implements InvocationRequest {
  public FunctionName: FunctionNamespace;
  public Payload?: AWS.Lambda._Blob;
  public InvocationType?: InvocationType;
  public LogType?: LogType;
  public Qualifier?: AWS.Lambda.Qualifier;
  //constructor(options?: Mobile.Types.ClientConfiguration)
  constructor(functionName: FunctionNamespace) {
    this.FunctionName = functionName;
    return this;
  }

  public getFunctionName = (): FunctionNamespace => this.FunctionName;

  public getPayload = (): AWS.Lambda._Blob | undefined => this.Payload;

  public getInvocationType = (): InvocationType | undefined => this.InvocationType;

  public getLogType = (): LogType | undefined => this.LogType;

  public getQualifier = (): AWS.Lambda.Qualifier | undefined => this.Qualifier;

  public setFunctionName = (functionName: FunctionNamespace): this => {
    this.FunctionName = functionName;
    return this;
  };

  public setPayload = (payload: AWS.Lambda._Blob): this => {
    this.Payload = payload;
    return this;
  };

  public setInvocationType = (invocationType: InvocationType): this => {
    this.InvocationType = invocationType;
    return this;
  };

  public setLogType = (logType: LogType): this => {
    this.LogType = logType;
    return this;
  };

  public setQualifier = (qualifier: AWS.Lambda.Qualifier): this => {
    this.Qualifier = qualifier;
    return this;
  };

  public toInvocationRequest = (): AWS.Lambda.InvocationRequest => {
    return {
      FunctionName: this.FunctionName,
      Payload: JSON.stringify(this.getPayload()),
      InvocationType: this.getInvocationType(),
      LogType: this.getLogType(),
      Qualifier: this.getQualifier()
    };
  };
}

class InvokerResponse implements InvocationResponse {
  public StatusCode?: AWS.Lambda.Integer | undefined;
  public ExecutedVersion?: string;
  public FunctionError?: string;
  public LogResult?: AWS.Lambda.LogType;
  public Payload?: AWS.Lambda._Blob;

  public getStatusCode = (): AWS.Lambda.Integer | undefined => this.StatusCode;

  public getExecutedVersion = (): string | undefined => this.ExecutedVersion;

  public getFunctionError = (): string | undefined => this.FunctionError;

  public getLogResult = (): AWS.Lambda.LogType | undefined => this.LogResult;

  public getPayload = (): AWS.Lambda._Blob | undefined => this.Payload;

  public setStatusCode = (statusCode: AWS.Lambda.Integer | undefined): this => {
    this.StatusCode = statusCode;
    return this;
  };

  public setExecutedVersion = (executedVersion: string | undefined): this => {
    this.ExecutedVersion = executedVersion;
    return this;
  };

  public setFunctionError = (functionError: string | undefined): this => {
    this.FunctionError = functionError;
    return this;
  };

  public setLogResult = (logResult: string | undefined): this => {
    this.LogResult = logResult;
    return this;
  };

  public setPayload = (payload: AWS.Lambda._Blob | undefined): this => {
    this.Payload = payload;
    return this;
  };
}

export class Invoker {
  private readonly _request: InvokerRequest;
  private _response: InvokerResponse | undefined;
  private readonly _awsLambda: AWS.Lambda;

  constructor(functionName: FunctionNamespace) {
    this._request = new InvokerRequest(functionName);
    this._awsLambda = new AWS.Lambda({
      region: process.env.AWS_REGION
    });
    this._awsLambda.endpoint = new Endpoint('http://host.docker.internal:3001');
    if (process.env.SIMULATE_AWS) {
      // console.log(process.env.SIMULATE_AWS_ENDPOINT);
      //this._awsLambda.endpoint = new Endpoint(process.env.SIMULATED_AWS_ENDPOINT!);
    }
    return this;
  }

  /** Request methods */
  public getFunctionName = (): FunctionNamespace => this._request?.getFunctionName();

  public getInvocationType = (): InvocationType | undefined => this._request.getInvocationType();

  public getLogType = (): LogType | undefined => this._request.getLogType();

  public getRequestPayload = (): AWS.Lambda._Blob | undefined => this._request.getPayload();

  public getQualifier = (): string | undefined => this._request.getQualifier();

  public setInvocationType = (invocationType: InvocationType): this => {
    this._request.setInvocationType(invocationType);
    return this;
  };

  public setLogType = (logType: LogType): this => {
    this._request.setLogType(logType);
    return this;
  };

  public setPayload = (payload: AWS.Lambda._Blob): this => {
    this._request.setPayload(payload);
    return this;
  };

  public setQualifier = (qualifier: string): this => {
    this._request.setQualifier(qualifier);
    return this;
  };

  /** Response methods */
  getStatusCode = (): number | undefined => this._response?.getStatusCode();

  getExecutedVersion = (): string | undefined => this._response?.getExecutedVersion();

  getFunctionError = (): string | undefined => this._response?.getFunctionError();

  getLogResult = (): string | undefined => this._response?.getLogResult();

  getResponsePayload = (): AWS.Lambda._Blob | undefined => this._response?.getPayload();

  /** Invoker methods */
  async invoke(): Promise<InvokerResponse> {
    const request = this._request.toInvocationRequest();
    log.setKey(mdcKey.invokerRequestBody, request);
    const subLog: Logger = log.createSubLogger(SubLogger.Invoker);
    subLog.info(loggerMessages.start);

    const response: AWS.Lambda.InvocationResponse = await this._awsLambda
      .invoke(this._request.toInvocationRequest())
      .promise();
    log.setKey(mdcKey.invokerResponseBody, response);
    subLog.info(loggerMessages.complete);
    this._response = new InvokerResponse()
      .setStatusCode(response.StatusCode)
      .setExecutedVersion(response.ExecutedVersion)
      .setFunctionError(response.FunctionError)
      .setLogResult(response.LogResult)
      .setPayload(response.Payload);
    return this._response;
  }
}
