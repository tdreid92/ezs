import { RateRequest } from '../rate-request';

export type PayloadRequest = RateRequest | undefined;
export type PayloadResponse = ResponseEntity;

export interface ResponseEntity {
  statusCode: number;
  body: any;
}
