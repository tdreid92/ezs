export enum HttpStatus {
  Success = 200,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  MethodNotAllowed = 405,
  PayloadTooLarge = 413,
  UnprocessableEntity = 422,
  InternalServerError = 500,
  NotImplemented = 501,
  ServiceUnavailable = 503
}
