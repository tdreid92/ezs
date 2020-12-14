import { Lambda } from 'aws-sdk';
import { FunctionNamespace, InvocationType, InvokerOptions, LogType } from './invoker-options';
import { PayloadRequest } from './payload';
import { Immutable } from '../../types/immutable';

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
