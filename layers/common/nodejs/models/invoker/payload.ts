import { RateRequest } from '../rate-request';
import { FindTranslationResponse } from '../find-translation-response';

export type PayloadRequest = RateRequest | undefined;
export type PayloadResponse = (ResponseEntity & PayloadBody) | FindTranslationResponse;

export interface ResponseEntity {
  statusCode: number;
}

export interface PayloadBody {
  body: any;
}
