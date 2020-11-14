import { LambdaInvoker } from '../../../layers/common/nodejs/models/lambda';
import {
  FunctionNamespace,
  ExchangeRate
} from '../../../layers/common/nodejs/utils/common-constants';

export const getExchangeRate = async (ratePair: ExchangeRate) => {
  const invocation = await new LambdaInvoker(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE)
    .setPayload({
      type: 'GET',
      ratePair
    })
    .invoke();
  return invocation.getPayload();
};

export const uploadExchangeRate = async (ratePair: ExchangeRate) => {
  const invocation = await new LambdaInvoker(FunctionNamespace.FIND_CRYPTOCURRENCY_RATE)
    .setPayload({
      type: 'UPLOAD',
      ratePairs: ratePair
    })
    .invoke();
  return invocation.getPayload();
};
