import { config } from './config';
import { Invoker } from '../../../layers/common/nodejs/models/invoker/invoker';
import { Query } from '../../../layers/common/nodejs/models/rate-request';
import { FunctionNamespace } from '../../../layers/common/nodejs/models/invoker/invoker-options';
import { CurrencyPair } from '../../../layers/common/nodejs/models/currency-pair';
import { ResponseEntity } from '../../../layers/common/nodejs/models/invoker/payload';
import { ExchangeRatePair } from '../../../layers/common/nodejs/models/exchange-rate-pair';

const options = {
  functionName: FunctionNamespace.ExchangeRateCrudService,
  lambdaEndpoint: config.lambdaEndpoint
};

const getExchangeRate = async (currPair: CurrencyPair): Promise<ResponseEntity> => {
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

const putExchangeRates = async (ratePairs: ExchangeRatePair[]): Promise<ResponseEntity> => {
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
