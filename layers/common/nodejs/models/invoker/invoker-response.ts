import { Lambda } from 'aws-sdk';
import { PayloadResponse, ResponseEntity } from './payload';
import { Immutable } from '../../types/immutable';
import { HttpError } from 'http-errors';

export class InvokerResponse<U> {
  public statusCode?: Immutable<Lambda.Integer>;
  public executedVersion?: Immutable<string>;
  public functionError?: Immutable<string>;
  public logResult?: Immutable<Lambda.LogType>;
  public payloadResponse?: PayloadResponse<U> | undefined;

  constructor(response?: Lambda.InvocationResponse) {
    if (response) {
      this.statusCode = response.StatusCode;
      this.executedVersion = response.ExecutedVersion;
      this.functionError = response.FunctionError;
      this.logResult = response.LogResult;
      if (response.Payload && typeof response.Payload === 'string') {
        this.payloadResponse = <PayloadResponse<U>>JSON.parse(response.Payload);
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
