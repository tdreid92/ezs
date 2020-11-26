import { LambdaInvoker } from '../../../layers/common/nodejs/models/lambda';
import {
  CurrencyPair,
  DbRequestType,
  ExchangeRatePair,
  FunctionNamespace
} from '../../../layers/common/nodejs/utils/common-constants';
import { DbPayload } from '../../find-cryptocurrency-rate';

export const getExchangeRate = async (currPair: CurrencyPair): Promise<DbPayload> => {
  const event: string = FunctionNamespace.FIND_CRYPTOCURRENCY_RATE + '-GET-REQUEST';
  console.info('START Event: %s %j: ', event, currPair);
  console.time(event);
  const invocation = await new LambdaInvoker(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE)
    .setPayload({
      requestType: DbRequestType.GET,
      getRateRequest: currPair
    })
    .invoke();
  const response = <DbPayload>invocation.getPayload();
  console.info('CLOSE  Event:  %s, %j', event, response);
  console.timeEnd(event);
  return response;
};

export const putExchangeRates = async (ratePairs: ExchangeRatePair[]): Promise<DbPayload> => {
  const event: string = FunctionNamespace.FIND_CRYPTOCURRENCY_RATE + '-PUT-REQUEST';
  console.info('START Event %s %j: ', event, ratePairs);
  console.time(event);
  const invocation = await new LambdaInvoker(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE)
    .setPayload({
      requestType: DbRequestType.PUT,
      putRatesRequest: ratePairs
    })
    .invoke();
  const response = <DbPayload>invocation.getPayload();
  console.info('CLOSE  Event:  %s, %j', event, response);
  console.timeEnd(event);
  return response;
};

export const listExchangeRates = async (): Promise<DbPayload> => {
  const event: string = FunctionNamespace.FIND_CRYPTOCURRENCY_RATE + '-LIST-REQUEST';
  console.info('START Event: %s: ', event);
  console.time(event);
  const invocation = await new LambdaInvoker(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE)
    .setPayload({
      requestType: DbRequestType.LIST
    })
    .invoke();
  const response = <DbPayload>invocation.getPayload();
  console.info('CLOSE  Event  %s, %j', event, response);
  console.timeEnd(event);
  return response;
};
