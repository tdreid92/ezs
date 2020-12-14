import { Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';

import createHttpError from 'http-errors';
import { response } from 'express';
import { InvokerResponse } from '../../../layers/common/nodejs/models/invoker/invoker-response';
import { Query } from '../../../layers/common/nodejs/models/rate-request';
import { FunctionNamespace } from '../../../layers/common/nodejs/models/invoker/invoker-options';
import { CurrencyPair } from '../../../layers/common/nodejs/models/currency-pair';
import { PayloadResponse } from '../../../layers/common/nodejs/models/invoker/payload';
import { ExchangeRatePair } from '../../../layers/common/nodejs/models/exchange-rate-pair';

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
      query: Query.Scan
    })
    .invoke();
  const response = <PayloadResponse>invocation.payloadResponse;
  return response;
};

const putExchangeRates = async (ratePairs: ExchangeRatePair[]): Promise<PayloadResponse> => {
  const invocation = await new Invoker({ functionName: FunctionNamespace.ExchangeRateCrudService })
    .setPayloadRequest({
      query: Query.BatchWrite,
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
