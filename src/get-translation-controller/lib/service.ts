import { config } from './config';
import { Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';
import { PayloadRequest, PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import {
  DatabaseGetRequest,
  DatabaseListRequest,
  DatabaseRequest,
  Query
} from '../../../layers/common/nodejs/models/database-request';
import { Handler } from 'aws-lambda';
import { HttpStatus } from '../../../layers/common/nodejs/utils/http-status';
import { HttpError } from 'http-errors';
import { commonUtils } from '../../../layers/common/nodejs/utils/common-utils';
import { APIGatewayGetEvent, APIGatewayResult } from '../../../layers/common/nodejs/log/event-logger';
import { TranslationRequest, TranslationResponse } from '../../../layers/common/nodejs/models/translation';

type GetResponse = PayloadResponse<TranslationResponse> | PayloadResponse<TranslationResponse[]> | HttpError;

const handleGet: Handler = async (
  event: APIGatewayGetEvent<TranslationRequest | undefined>
): Promise<APIGatewayResult> => {
  const response: GetResponse = await getRoutedResponse(event.pathParameters);

  return response.statusCode == HttpStatus.Success
    ? {
        statusCode: response.statusCode,
        body: JSON.stringify(response.body)
      }
    : (response as HttpError);
};

const getRoutedResponse = async (req: TranslationRequest | undefined): Promise<GetResponse> => {
  return commonUtils.isEmptyObj(req) ? await getTranslation(req!) : await listTranslations();
};

const getTranslation = async (req: TranslationRequest): Promise<PayloadResponse<TranslationResponse> | HttpError> => {
  // if (req.source == req.target) {
  //   return untranslatedResponse(req);
  // }

  return await new Invoker<DatabaseRequest, TranslationRequest>({
    functionName: config.repositoryServiceFunction,
    functionEndpoint: config.functionEndpoint
  })
    .setPayloadRequest({
      payload: {
        query: Query.Get,
        getRequest: req
      } as DatabaseGetRequest
    } as PayloadRequest<DatabaseGetRequest>)
    .invoke()
    .then((invoker: Invoker) => invoker.getPayloadResponse());
};

const listTranslations = async (): Promise<PayloadResponse<TranslationResponse[]> | HttpError> =>
  await new Invoker<DatabaseRequest, TranslationResponse[]>({
    functionName: config.repositoryServiceFunction,
    functionEndpoint: config.functionEndpoint
  })
    .setPayloadRequest({
      payload: {
        query: Query.List
      } as DatabaseListRequest
    } as PayloadRequest<DatabaseListRequest>)
    .invoke()
    .then((invoker: Invoker) => invoker.getPayloadResponse());

// const untranslatedResponse = (req: Definition): PayloadResponse<Definition> => ({
//   statusCode: HttpStatus.Success,
//   body: {
//     source: req.source,
//     target: req.target,
//     word: req.word,
//     content: req.word
//   }
// });

export const service = {
  handle: handleGet
};
