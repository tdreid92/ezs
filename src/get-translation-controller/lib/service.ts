import { config } from './config';
import { Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';
import { GetTranslationRequest } from '../../../layers/common/nodejs/models/get-translation-request';
import { PayloadRequest, PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { Query } from '../../../layers/common/nodejs/models/database-request';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

const handleGet: Handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const pathParams: GetTranslationRequest = <GetTranslationRequest>(<unknown>event.pathParameters);
  const getResponse: PayloadResponse = await getDefinition(<GetTranslationRequest>(<unknown>event.pathParameters));
  if (getResponse.statusCode == 200) {
    return {
      statusCode: getResponse.statusCode,
      body: JSON.stringify(getResponse.body)
    };
  }
  return getResponse;
};

const getDefinition = async (getRequest: GetTranslationRequest): Promise<PayloadResponse> => {
  if (getRequest.source == getRequest.target) {
    return untranslatedResponse(getRequest);
  }

  const payloadRequest: PayloadRequest = {
    payload: {
      query: Query.Get,
      getRequest: getRequest
    }
  };

  const databaseInvocation = await new Invoker({
    functionName: config.repositoryServiceFunction,
    functionEndpoint: config.functionEndpoint
  })
    .setPayloadRequest(payloadRequest)
    .invoke();
  return <PayloadResponse>databaseInvocation.payloadResponse;
};

const untranslatedResponse = (getRequest: GetTranslationRequest): PayloadResponse => ({
  statusCode: 200,
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
