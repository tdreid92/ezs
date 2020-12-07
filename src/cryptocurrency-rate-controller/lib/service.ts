import { Invoker, InvokerResponse } from '../../../layers/common/nodejs/models/invoker';
import {
  CurrencyPair,
  ExchangeRatePair,
  FunctionNamespace,
  PayloadResponse,
  Query
} from '../../../layers/common/nodejs/utils/common-constants';
import createHttpError from 'http-errors';
import { response } from 'express';

const getExchangeRate = async (currPair: CurrencyPair): Promise<undefined> => {
  const invocation = await new Invoker({ functionName: FunctionNamespace.ExchangeRateCrudService })
    .setPayloadRequest({
      query: Query.Get,
      getRateRequest: currPair
    })
    .invoke()
    .then((response: InvokerResponse) => {
      console.log(response);
      return response;
    })
    .catch((error: Error) => {
      console.log('ERR' + response);
      throw error;
    });
  return undefined;
};

const listExchangeRates = async (): Promise<PayloadResponse> => {
  const invocation = await new Invoker({ functionName: FunctionNamespace.ExchangeRateCrudService })
    .setPayloadRequest({
      query: Query.List
    })
    .invoke();
  const response = <PayloadResponse>invocation.payloadResponse;
  return response;
};

const putExchangeRates = async (ratePairs: ExchangeRatePair[]): Promise<PayloadResponse> => {
  const invocation = await new Invoker({ functionName: FunctionNamespace.ExchangeRateCrudService })
    .setPayloadRequest({
      query: Query.Put,
      putRatesRequest: ratePairs
    })
    .invoke();
  const response = <PayloadResponse>invocation.payloadResponse;
  return response;
};

export const exchangeRateService = {
  getExchangeRate: getExchangeRate,
  putExchangeRates: putExchangeRates,
  listExchangeRates: listExchangeRates
};
