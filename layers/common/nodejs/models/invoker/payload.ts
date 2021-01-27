export interface PayloadRequest<T> {
  payload: T;
}

export interface PayloadResponse<T = any> {
  statusCode: number;
  body: T;
}

export interface ResponseEntity {
  statusCode: number;
}

export interface PayloadBody {
  body: any;
}
