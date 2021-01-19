import { GetTranslationRequest } from './get-translation-request';
import { UploadTranslationRequest } from './upload-translation-request';

export interface DatabaseRequest {
  query: Query;
  getRequest?: GetTranslationRequest;
  updateRequest?: UploadTranslationRequest[];
}

export const enum Query {
  Get = 'Get',
  Scan = 'Scan',
  BatchWrite = 'BatchWrite',
  Update = 'Update'
}
