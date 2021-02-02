import { config } from './config';
import { Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';
import { GetTranslationRequest } from '../../../layers/common/nodejs/models/get-translation-request';
import { PayloadRequest, PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { DatabaseRequest, Query } from '../../../layers/common/nodejs/models/database-request';
import { Handler } from 'aws-lambda';
import { GetTranslationResponse } from '../../../layers/common/nodejs/models/get-translation-response';
import { APIGatewayGetEvent, APIGatewayResult } from '../../../layers/common/nodejs/log/event';
import { HttpStatus } from '../../../layers/common/nodejs/utils/http-status';
import { HttpError } from 'http-errors';
import { commonUtils } from '../../../layers/common/nodejs/utils/common-utils';

const handleGet: Handler = async (event: APIGatewayGetEvent<GetTranslationRequest>): Promise<APIGatewayResult> => {
  const response:
    | PayloadResponse<GetTranslationResponse>
    | PayloadResponse<GetTranslationResponse[]>
    | HttpError = commonUtils.isEmptyObj(event.pathParameters)
    ? await getDefinition(event.pathParameters!)
    : await scanDefinitions();
  return response.statusCode == HttpStatus.Success
    ? {
        statusCode: response.statusCode,
        body: JSON.stringify(response.body)
      }
    : (response as HttpError);
};

const scanDefinitions = async (): Promise<PayloadResponse<GetTranslationResponse[]> | HttpError> =>
  await new Invoker<DatabaseRequest, GetTranslationResponse[]>({
    functionName: config.repositoryServiceFunction,
    functionEndpoint: config.functionEndpoint
  })
    .setPayloadRequest({
      payload: {
        query: Query.Scan
      }
    } as PayloadRequest<DatabaseRequest>)
    .invoke()
    .then((invoker: Invoker) => invoker.getPayloadResponse());

const getDefinition = async (
  getRequest: GetTranslationRequest
): Promise<PayloadResponse<GetTranslationResponse> | HttpError> => {
  if (getRequest.source == getRequest.target) {
    return untranslatedResponse(getRequest);
  }

  return await new Invoker<DatabaseRequest, GetTranslationResponse>({
    functionName: config.repositoryServiceFunction,
    functionEndpoint: config.functionEndpoint
  })
    .setPayloadRequest({
      payload: {
        query: Query.Get,
        getRequest: getRequest
      }
    } as PayloadRequest<DatabaseRequest>)
    .invoke()
    .then((invoker: Invoker) => invoker.getPayloadResponse());
};

const untranslatedResponse = (getRequest: GetTranslationRequest): PayloadResponse<GetTranslationResponse> => ({
  statusCode: HttpStatus.Success,
  body: {
    source: getRequest.source,
    target: getRequest.target,
    word: getRequest.word,
    definition: getRequest.word
  }
});

export const service = {
  handle: handleGet
};
