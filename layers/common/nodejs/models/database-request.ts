import { GetTranslationRequest } from './get-translation-request';
import { UploadTranslationRequest } from './upload-translation-request';
import { UpdateTranslationRequest } from './update-translation-request';

export interface DatabaseRequest {
  query: Query;
  getRequest?: GetTranslationRequest;
  uploadRequests?: UploadTranslationRequest[];
  updateRequest?: UpdateTranslationRequest;
}

export const enum Query {
  Get = 'Get',
  Scan = 'Scan',
  BatchWrite = 'BatchWrite',
  Update = 'Update'
}
