import { RateRequest } from '../rate-request';

export type PayloadRequest = RateRequest | undefined;

export interface PayloadResponse {
  statusCode: number;
  body: any;
}
