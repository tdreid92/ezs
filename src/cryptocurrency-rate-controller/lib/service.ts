import { LambdaInvoker } from '../../../layers/common/nodejs/models/lambda';
import {
  CurrencyPair,
  PayloadResponse,
  DbRequest,
  ExchangeRatePair,
  FunctionNamespace
} from '../../../layers/common/nodejs/utils/common-constants';

const getExchangeRate = async (currPair: CurrencyPair): Promise<PayloadResponse> => {
  const invocation = await new LambdaInvoker(FunctionNamespace.ExchangeRateCrudService)
    .setPayload({
      requestType: DbRequest.Get,
      getRateRequest: currPair
    })
    .invoke();
  const response = <PayloadResponse>invocation.getPayload();
  return response;
};

const listExchangeRates = async (): Promise<PayloadResponse> => {
  const invocation = await new LambdaInvoker(FunctionNamespace.ExchangeRateCrudService)
    .setPayload({
      requestType: DbRequest.List
    })
    .invoke();
  const response = <PayloadResponse>invocation.getPayload();
  return response;
};

const putExchangeRates = async (ratePairs: ExchangeRatePair[]): Promise<PayloadResponse> => {
  const invocation = await new LambdaInvoker(FunctionNamespace.ExchangeRateCrudService)
    .setPayload({
      requestType: DbRequest.Put,
      putRatesRequest: ratePairs
    })
    .invoke();
  const response = <PayloadResponse>invocation.getPayload();
  return response;
};

export const service = {
  getExchangeRate: getExchangeRate,
  putExchangeRates: putExchangeRates,
  listExchangeRates: listExchangeRates
};
