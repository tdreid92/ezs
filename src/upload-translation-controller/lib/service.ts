import { config } from './config';
import { InvocationType, Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';
import { DatabasePutRequest, DatabaseRequest, Query } from '../../../layers/common/nodejs/models/database-request';
import { PayloadRequest, PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { Handler } from 'aws-lambda';
import { HttpStatus } from '../../../layers/common/nodejs/utils/http-status';
import { HttpError } from 'http-errors';
import { APIGatewayPostEvent, APIGatewayResult } from '../../../layers/common/nodejs/log/event-logger';
import {
  Definition,
  DefinitionsRequest,
  Language,
  PollyRequest
} from '../../../layers/common/nodejs/models/translation';

const handlePost: Handler = async (event: APIGatewayPostEvent<DefinitionsRequest>): Promise<APIGatewayResult> => {
  const request: DefinitionsRequest = event.body;
  const response: PayloadResponse<any> | HttpError = await uploadDefinitions(request);
  return response.statusCode == HttpStatus.Success
    ? {
        statusCode: response.statusCode,
        body: JSON.stringify(response.body)
      }
    : (response as HttpError);
};

const uploadDefinitions = async (definitionsRequest: DefinitionsRequest): Promise<PayloadResponse<any> | HttpError> => {
  const definitions: Definition[] = definitionsRequest.definitions;

  const databaseInvocation = await new Invoker({
    functionName: config.repositoryServiceFunction,
    functionEndpoint: config.functionEndpoint
  })
    .setPayloadRequest({
      payload: {
        query: Query.Write,
        putRequest: definitions
      } as DatabasePutRequest
    } as PayloadRequest<DatabasePutRequest>)
    .invoke()
    .then((invoker: Invoker) => invoker.getPayloadResponse());

  await new Invoker({
    functionName: config.pollySynthesizerFunction,
    functionEndpoint: config.functionEndpoint,
    invocationType: InvocationType.RequestResponse
  })
    .setPayloadRequest({
      payload: definitions.map(
        (def: Definition) =>
          ({
            language: Language.DE,
            word: def.word,
            speed: 'Medium'
          } as PollyRequest)
      )
    } as PayloadRequest<PollyRequest[]>)
    .invoke()
    .then((invoker: Invoker) => invoker.getPayloadResponse());

  return databaseInvocation;
};

export const service = {
  handle: handlePost
};
