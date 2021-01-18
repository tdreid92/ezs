import { FindTranslationResponse } from './find-translation-response';
import { TranslationUploadRequest } from './translation-upload-request';

export interface RateRequest {
  query: Query;
  getRateRequest?: FindTranslationResponse;
  putRatesRequest?: TranslationUploadRequest[];
}

export const enum Query {
  Get = 'Get',
  Scan = 'Scan',
  BatchWrite = 'BatchWrite'
}
