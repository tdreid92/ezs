import { DatabaseRequest } from '../database-request';
import {PollyUploadRequest} from "../polly-upload-request";


export type PayloadRequest = DatabaseRequest | PollyUploadRequest[];
export type PayloadResponse = ResponseEntity & PayloadBody;

export interface ResponseEntity {
  statusCode: number;
}

export interface PayloadBody {
  body: any;
}
