import { Query, RateRequest } from '../../layers/common/nodejs/models/rate-request';
import { crudRateService } from '../../src/find-cryptocurrency-rate/lib/crud-rate-service';
import { ResponseEntity } from '../../layers/common/nodejs/models/invoker/payload';
import { dbUtils } from '../../src/find-cryptocurrency-rate/lib/db-utils';
import { repository } from '../../src/find-cryptocurrency-rate/lib/rate-repository';

jest.mock('../../src/find-cryptocurrency-rate/lib/db-utils');

describe('crud-rate-service', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });
  //const handleCrudEvent = async (event: RateRequest): Promise<ResponseEntity> => {
  test('should return data', async () => {
    const rateRequest: RateRequest = {
      query: Query.Get,
      getRateRequest: {
        baseCurr: 'USD',
        quoteCurr: 'EUR',
        date: '2202'
      }
    };
    const mockResult: ResponseEntity = {
      statusCode: 200,
      body: {}
    };
    const isTableUndefinedSpy = jest.spyOn(dbUtils, 'isTableUndefined').mockReturnValueOnce(false);

    const repositoryGetSpy = jest.spyOn(repository, 'get').mockReturnValueOnce(Promise.resolve(mockResult));
    const val: ResponseEntity = await crudRateService.handleCrudEvent(rateRequest);
    expect(val).toBe(mockResult);
    expect(repositoryGetSpy).toBeCalledTimes(1);
  });
  //   // const mResponse = { code: 200, data: 'mocked data' };
  //   // const mEvent = { id: 1 };
  //   // const retrieveDataSpy = jest.spyOn(handler(), 'retrieveData').mockResolvedValueOnce(mResponse);
  //   // const actualValue = await lambdaService(mEvent);
  //   // expect(actualValue).toEqual(mResponse);
  //   // expect(retrieveDataSpy).toBeCalledWith(mEvent.id);
  // });
});
