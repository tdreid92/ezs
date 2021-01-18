import { config } from './config';
import { Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';
import { Query } from '../../../layers/common/nodejs/models/rate-request';
import { FindTranslationResponse } from '../../../layers/common/nodejs/models/find-translation-response';
import { ResponseEntity } from '../../../layers/common/nodejs/models/invoker/payload';
import { TranslationUploadRequest } from '../../../layers/common/nodejs/models/translation-upload-request';

const options = {
  functionName: config.uploadTranslationFunction,
  lambdaEndpoint: config.functionEndpoint
};

const getExchangeRate = async (currPair: FindTranslationResponse): Promise<ResponseEntity> => {
  const invocation = await new Invoker(options)
    .setPayloadRequest({
      query: Query.Get,
      getRateRequest: currPair
    })
    .invoke();
  return <ResponseEntity>invocation.payloadResponse;
};

const listExchangeRates = async (): Promise<ResponseEntity> => {
  const invocation = await new Invoker(options)
    .setPayloadRequest({
      query: Query.Scan
    })
    .invoke();
  return <ResponseEntity>invocation.payloadResponse;
};

const putExchangeRates = async (ratePairs: TranslationUploadRequest[]): Promise<ResponseEntity> => {
  const invocation = await new Invoker(options)
    .setPayloadRequest({
      query: Query.BatchWrite,
      putRatesRequest: ratePairs
    })
    .invoke();
  return <ResponseEntity>invocation.payloadResponse;
};

export const exchangeRateService = {
  getExchangeRate: getExchangeRate,
  putExchangeRates: putExchangeRates,
  listExchangeRates: listExchangeRates
};
