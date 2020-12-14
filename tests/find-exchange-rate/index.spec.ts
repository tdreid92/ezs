import {} from '../../src/find-cryptocurrency-rate/index';
import {
  CurrencyPair,
  Query,
  ExchangeRatePair,
  HttpStatus
} from '../../layers/common/nodejs/utils/common-types';
const context = {
  callbackWaitsForEmptyEventLoop: true,
  functionVersion: '$LATEST',
  functionName: 'test',
  memoryLimitInMB: '128',
  logGroupName: '/aws/lambda/test',
  logStreamName: '2020/11/30/[$LATEST]db9d556738ee6798b8bd5daa3725907d',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:1945946315:function:test',
  awsRequestId: '41c8e19e-1cfe-155d-81fd-31719b71bfa2',
  logger: {
    events: {
      _events: {},
      _eventsCount: 1
    }
  }
};

describe('find-exchange-rate-index', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  test('should return data', async () => {
    // const res = await handler({
    //   query: Query.Get,
    //   getRateRequest: undefined,
    //   putRatesRequest: undefined
    // });
    // console.log(res);
  });
  //   // const mResponse = { code: 200, data: 'mocked data' };
  //   // const mEvent = { id: 1 };
  //   // const retrieveDataSpy = jest.spyOn(handler(), 'retrieveData').mockResolvedValueOnce(mResponse);
  //   // const actualValue = await lambdaService(mEvent);
  //   // expect(actualValue).toEqual(mResponse);
  //   // expect(retrieveDataSpy).toBeCalledWith(mEvent.id);
  // });
});
