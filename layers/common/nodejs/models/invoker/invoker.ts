import { Lambda } from 'aws-sdk';
import { log } from '../../log/sam-logger';
import { Logger } from 'lambda-logger-node';
import { loggerMessages, mdcKeys, SubLogger } from '../../log/log-constants';
import { InvokerConfiguration } from './invoker-configuration';
import { InvokerRequest } from './invoker-request';
import { InvokerResponse } from './invoker-response';
import { ResponseEntity } from './payload';

/** Refer to https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html for more information. */
export class Invoker extends InvokerRequest {
  private _response: InvokerResponse | undefined;

  constructor(options: InvokerConfiguration) {
    super(options);
    return this;
  }

  /** Response methods */
  getStatusCode = (): number | undefined => this._response?.statusCode;

  getExecutedVersion = (): string | undefined => this._response?.executedVersion;

  getFunctionError = (): string | undefined => this._response?.functionError;

  getLogResult = (): string | undefined => this._response?.logResult;

  getPayloadResponse = (): ResponseEntity | undefined => this._response?.payloadResponse;

  /** Invoker methods */
  async invoke(): Promise<InvokerResponse> {
    const subLog: Logger = log.createSubLogger(SubLogger.INVOKER);

    log.setKey(mdcKeys.invokerRequestBody, this.toJSON());
    subLog.info(loggerMessages.started);

    const request: Lambda.InvocationRequest = this.toInvocationRequest();

    const response: Lambda.InvocationResponse = await this._lambda.invoke(request).promise();
    this._response = new InvokerResponse(response);

    log.setKey(mdcKeys.invokerResponseBody, this._response.toJSON());
    subLog.info(loggerMessages.completed);

    return this._response;
  }
}
