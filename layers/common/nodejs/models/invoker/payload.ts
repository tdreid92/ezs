import { GetTranslationResponse } from '../get-translation-response';
import { UploadTranslationRequest } from '../upload-translation-request';
import { GetTranslationRequest } from '../get-translation-request';
import { DatabaseRequest } from '../database-request';

export type PayloadRequest = DatabaseRequest;
export type PayloadResponse = ResponseEntity & PayloadBody;

export interface ResponseEntity {
  statusCode: number;
}

export interface PayloadBody {
  body: any;
}
