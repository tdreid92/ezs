import { GetTranslationResponse } from '../../../layers/common/nodejs/models/get-translation-response';
import { BulkUploadTranslationResponse } from '../../../layers/common/nodejs/models/bulk-upload-translation-response';

export type databaseResponse = GetTranslationResponse | BulkUploadTranslationResponse | any;
