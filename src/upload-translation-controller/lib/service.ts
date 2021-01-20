import { config } from './config';
import { Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';
import { Query } from '../../../layers/common/nodejs/models/database-request';
import { PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { UploadTranslationRequest } from '../../../layers/common/nodejs/models/upload-translation-request';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import { BulkUploadTranslationRequest } from '../../../layers/common/nodejs/models/bulk-upload-translation-request';

const handlePost: Handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const bulkUploadResponse: PayloadResponse = await uploadDefinition(
    (<BulkUploadTranslationRequest>(<unknown>event.body)).translations
  );
  if (bulkUploadResponse.statusCode == 200) {
    return {
      statusCode: bulkUploadResponse.statusCode,
      body: JSON.stringify(bulkUploadResponse.body)
    };
  }
  return bulkUploadResponse;
};

const uploadDefinition = async (uploadRequests: UploadTranslationRequest[]): Promise<PayloadResponse> => {
  const databaseInvocation = await new Invoker({
    functionName: config.repositoryHandlerFunction,
    functionEndpoint: config.functionEndpoint
  })
    .setPayloadRequest({
      query: Query.BatchWrite,
      uploadRequests: uploadRequests
    })
    .invoke();

  // const invocationSpeech = await new Invoker({
  //   functionName: config.uploadTranslationFunction,
  //   functionEndpoint: config.functionEndpoint
  // })
  //   .setPayloadRequest(bulkUploadTranslationRequest)
  //   .invoke();
  return <PayloadResponse>databaseInvocation.payloadResponse;
};

export const service = {
  handle: handlePost
};
