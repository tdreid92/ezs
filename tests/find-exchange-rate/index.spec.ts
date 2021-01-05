import { handler } from '../../src/find-exchange-rate';
import { Query, RateRequest } from '../../layers/common/nodejs/models/rate-request';
import { Context } from 'aws-lambda';
import { crudRateService } from '../../src/find-exchange-rate/lib/crud-rate-service';
import { ResponseEntity } from '../../layers/common/nodejs/models/invoker/payload';

process.env.DYNAMODB_TABLE = 'test_table';
process.env.DYNAMODB_ENDPOINT = 'test_endpoint';
//
// jest.mock('../../src/find-cryptocurrency-rate/lib/crud-rate-service', () => ({
//   crudRateService: jest.fn()
// }));

describe('find-exchange-rate-index', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    process.env = Object.assign(process.env, { DYNAMODB_ENDPOINT: 'value' });
    process.env.DYNAMODB_TABLE = 'test_table';
    process.env.DYNAMODB_ENDPOINT = 'test_endpoint';
  });

  test('should return data', async () => {
    const rateRequest: RateRequest = {
      query: Query.Get,
      getRateRequest: undefined,
      putRatesRequest: undefined
    };
    const context = {} as Context;
    const callback = () => null;
    const mockResult: Promise<ResponseEntity> = Promise.resolve({
      statusCode: 200,
      body: {}
    });
    const spy = jest.spyOn(crudRateService, 'handleCrudEvent');

    spy.mockReturnValue(mockResult);

    expect(await handler(rateRequest, context, callback)).toBe('mocked'); // Success!

    spy.mockRestore();
    // const mockFn = jest.fn(() => mockResult);
    // const value =
    // crudRateService.handleCrudEvent = jest.fn().mockReturnThis();
    // const mock = jest.spyOn(crudRateService, 'handleCrudEvent');
    // const result = mock(rateRequest, context, callback);

    // const res = await handler(rateRequest, context, callback);
  });
  //   // const mResponse = { code: 200, data: 'mocked data' };
  //   // const mEvent = { id: 1 };
  //   // const retrieveDataSpy = jest.spyOn(handler(), 'retrieveData').mockResolvedValueOnce(mResponse);
  //   // const actualValue = await lambdaService(mEvent);
  //   // expect(actualValue).toEqual(mResponse);
  //   // expect(retrieveDataSpy).toBeCalledWith(mEvent.id);
  // });
});
