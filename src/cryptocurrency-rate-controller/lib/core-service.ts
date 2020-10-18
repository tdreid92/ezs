import { LambdaInvoker } from '../../../layers/common/nodejs/models/lambda';
import {
  FunctionNamespace,
  ExchangeRatePair,
  RateRequest
} from '../../../layers/common/nodejs/utils/common-constants';

export const getRate = async (baseCurr: string, quoteCurr: string, date: string) => {
  const invocation = await new LambdaInvoker(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE)
    .setPayload({
      type: 'GET',
      ratePair: {
        baseCurr: baseCurr,
        date: date,
        quoteCurr: quoteCurr
      }
    })
    .invoke();
  return invocation.getPayload();
};

export const uploadRate = async (ratePair: ExchangeRatePair) => {
  const invocation = await new LambdaInvoker(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE)
    .setPayload({
      type: 'UPLOAD',
      ratePair: ratePair
    })
    .invoke();
  return invocation.Payload;
};
