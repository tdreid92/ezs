import { LambdaInvoker } from '../../../layers/common/nodejs/models/lambda';
import { FunctionNamespace } from '../../../layers/common/nodejs/utils/common-constants';

export const getRate = async (fromCurr: string, toCurr: string) => {
  const invocation = await new LambdaInvoker(FunctionNamespace.FIND_CRYPTOCURRENCY_EXCHANGE_RATE)
    .setPayload({
      fromCurr: fromCurr,
      toCurr: toCurr
    })
    .invoke();
  return invocation.Payload;
};
