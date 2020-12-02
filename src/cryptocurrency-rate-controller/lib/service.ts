import { LambdaInvoker } from '../../../layers/common/nodejs/models/lambda';
import {
  CurrencyPair,
  DbPayload,
  DbRequest,
  ExchangeRatePair,
  FunctionNamespace
} from '../../../layers/common/nodejs/utils/common-constants';

const getExchangeRate = async (currPair: CurrencyPair): Promise<DbPayload> => {
  const invocation = await new LambdaInvoker(FunctionNamespace.ExchangeRateCrudService)
    .setPayload({
      requestType: DbRequest.Get,
      getRateRequest: currPair
    })
    .invoke();
  const response = <DbPayload>invocation.getPayload();
  return response;
};

const listExchangeRates = async (): Promise<DbPayload> => {
  const invocation = await new LambdaInvoker(FunctionNamespace.ExchangeRateCrudService)
    .setPayload({
      requestType: DbRequest.List
    })
    .invoke();
  const response = <DbPayload>invocation.getPayload();
  return response;
};

const putExchangeRates = async (ratePairs: ExchangeRatePair[]): Promise<DbPayload> => {
  const invocation = await new LambdaInvoker(FunctionNamespace.ExchangeRateCrudService)
    .setPayload({
      requestType: DbRequest.Put,
      putRatesRequest: ratePairs
    })
    .invoke();
  const response = <DbPayload>invocation.getPayload();
  return response;
};

export const service = {
  getExchangeRate: getExchangeRate,
  putExchangeRates: putExchangeRates,
  listExchangeRates: listExchangeRates
};
