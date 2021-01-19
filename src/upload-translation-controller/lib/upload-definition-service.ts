import { config } from './config';
import { Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';
import { Query } from '../../../layers/common/nodejs/models/database-request';
import { GetTranslationRequest } from '../../../layers/common/nodejs/models/get-translation-request';
import { PayloadResponse, ResponseEntity } from '../../../layers/common/nodejs/models/invoker/payload';
import { UploadTranslationRequest } from '../../../layers/common/nodejs/models/upload-translation-request';
import { EventResponse } from '../../../layers/common/nodejs/middleware/lambda-event-logger';

const uploadDefinition = async (uploadRequest: UploadTranslationRequest[]): Promise<PayloadResponse> => {
  const databaseInvocation = await new Invoker({
    functionName: config.repositoryHandlerFunction,
    functionEndpoint: config.functionEndpoint
  })
    .setPayloadRequest({
      query: Query.Update,
      updateRequest: uploadRequest
    })
    .invoke();

  // const invocationSpeech = await new Invoker({
  //   functionName: config.uploadTranslationFunction,
  //   functionEndpoint: config.functionEndpoint
  // })
  //   .setPayloadRequest(uploadRequest)
  //   .invoke();
  return <PayloadResponse>databaseInvocation.payloadResponse;
};

export const uploadDefinitionService = {
  uploadDefinition: uploadDefinition
};
