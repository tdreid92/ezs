import { Invoker } from '../../../layers/common/nodejs/models/invoker';
import {
  CurrencyPair,
  PayloadResponse,
  Query,
  ExchangeRatePair,
  FunctionNamespace
} from '../../../layers/common/nodejs/utils/common-constants';

const getExchangeRate = async (currPair: CurrencyPair): Promise<PayloadResponse> => {
  const invocation = await new Invoker(FunctionNamespace.ExchangeRateCrudService)
    .setPayload({
      query: Query.Get,
      getRateRequest: currPair
    })
    .invoke();
  const response = <PayloadResponse>invocation.getPayload();
  return response;
};

const listExchangeRates = async (): Promise<PayloadResponse> => {
  const invocation = await new Invoker(FunctionNamespace.ExchangeRateCrudService)
    .setPayload({
      query: Query.List
    })
    .invoke();
  const response = <PayloadResponse>invocation.getPayload();
  return response;
};

const putExchangeRates = async (ratePairs: ExchangeRatePair[]): Promise<PayloadResponse> => {
  const invocation = await new Invoker(FunctionNamespace.ExchangeRateCrudService)
    .setPayload({
      query: Query.Put,
      putRatesRequest: ratePairs
    })
    .invoke();
  const response = <PayloadResponse>invocation.getPayload();
  return response;
};

export const exchangeRateService = {
  getExchangeRate: getExchangeRate,
  putExchangeRates: putExchangeRates,
  listExchangeRates: listExchangeRates
};
