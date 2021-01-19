import { config } from './config';
import { Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';
import { GetTranslationRequest } from '../../../layers/common/nodejs/models/get-translation-request';
import { PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { Query } from '../../../layers/common/nodejs/models/database-request';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

const handleGetRequest: Handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
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
  const databaseInvocation = await new Invoker({
    functionName: config.repositoryHandlerFunction,
    functionEndpoint: config.functionEndpoint
  })
    .setPayloadRequest({
      query: Query.Get,
      getRequest: getRequest
    })
    .invoke();
  return <PayloadResponse>databaseInvocation.payloadResponse;
};

export const service = {
  handle: handleGetRequest
};
