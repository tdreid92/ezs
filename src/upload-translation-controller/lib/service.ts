import { config } from './config';
import { Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';
import { DatabaseRequest, Query } from '../../../layers/common/nodejs/models/database-request';
import { PayloadRequest, PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { Handler } from 'aws-lambda';
import { BulkUploadTranslationRequest } from '../../../layers/common/nodejs/models/bulk-upload-translation-request';
import { APIGatewayPostEvent, APIGatewayResult } from '../../../layers/common/nodejs/log/event';
import { HttpStatus } from '../../../layers/common/nodejs/utils/http-status';
import { HttpError } from 'http-errors';
import { BulkUploadTranslationResponse } from '../../../layers/common/nodejs/models/bulk-upload-translation-response';

const handlePost: Handler = async (
  event: APIGatewayPostEvent<BulkUploadTranslationRequest>
): Promise<APIGatewayResult> => {
  const request: BulkUploadTranslationRequest = event.body;
  const response: PayloadResponse<BulkUploadTranslationResponse> | HttpError = await uploadDefinition(request);
  return response.statusCode == HttpStatus.Success
    ? {
        statusCode: response.statusCode,
        body: JSON.stringify(response.body)
      }
    : (response as HttpError);
};

const uploadDefinition = async (
  uploadRequests: BulkUploadTranslationRequest
): Promise<PayloadResponse<BulkUploadTranslationResponse> | HttpError> => {
  const databaseInvocation = await new Invoker({
    functionName: config.repositoryServiceFunction,
    functionEndpoint: config.functionEndpoint
  })
    .setPayloadRequest({
      payload: {
        query: Query.BatchWrite,
        uploadRequests: uploadRequests.translations
      }
    } as PayloadRequest<DatabaseRequest>)
    .invoke()
    .then((invoker: Invoker) => invoker.getPayloadResponse());
  //try catch?
  // const pollyUploadRequests: PollyUploadRequest[] = uploadRequests.map((req: UploadTranslationRequest) => ({
  //   language: (req.source as unknown) as Language,
  //   word: req.word,
  //   speed: 'Medium'
  // }));
  // const pollyInvocation = await new Invoker({
  //   functionName: config.speechSynthesizerFunction,
  //   functionEndpoint: config.functionEndpoint
  // })
  //   .setPayloadRequest(pollyUploadRequests)
  //   .invoke();
  return databaseInvocation;
};

export const service = {
  handle: handlePost
};
