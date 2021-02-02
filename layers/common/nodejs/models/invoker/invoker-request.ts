import { Lambda } from 'aws-sdk';
import { PayloadRequest } from './payload';
import { Immutable } from '../../types/immutable';
import { InvocationType, InvokerConfiguration, LogType } from './invoker-configuration';

export class InvokerRequest<T> {
  public functionName: Immutable<string>;
  public payloadRequest?: Immutable<PayloadRequest<any>>;
  public invocationType?: Immutable<InvocationType>;
  public logType?: Immutable<LogType>;
  public qualifier?: Immutable<Lambda.Qualifier>;
  protected _lambda: Lambda;

  constructor(options: InvokerConfiguration) {
    this.functionName = options.functionName;
    this.invocationType = options.InvocationType;
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
