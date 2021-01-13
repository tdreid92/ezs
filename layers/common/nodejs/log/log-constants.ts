export const mdcKeys = {
  /** General bucket */
  traceId: 'traceId',
  traceIndex: 'traceIndex',
  date: 'date',
  appName: 'appName',
  version: 'version',
  elapsedTime: 'duration_ms',
  functionNamespace: 'functionNamespace',
  resource: 'resource',
  stage: 'stage',

  /** Request bucket */
  requestBody: 'request.body',
  requestMethod: 'request.method',
  requestPath: 'request.path',

  /** Response bucket */
  responseBody: 'response.body',
  responseStatusCode: 'response.statusCode',
  responseHeaders: 'response.headers',

  /** Database bucket */
  databaseQuery: 'db.query',
  databaseResult: 'db.result',
  databaseElapsedTime: 'db.duration_ms',

  /** Invoker bucket */
  invokerRequestBody: 'invoker.request.body',
  invokerResponseBody: 'invoker.response.body',
  invokerElapsedTime: 'invoker.duration_ms',

  /** Error bucket */
  errorName: 'error.name',
  errorMessage: 'error.message',
  errorStacktrace: 'error.stacktrace'
};

export const loggerMessages = {
  start: '_REQUEST STARTED_',
  complete: '_REQUEST COMPLETED_',
  failed: '_REQUEST FAILED_'
};

export const enum SubLogger {
  DATABASE = 'DATABASE',
  INVOKER = 'INVOKER',
  LAMBDA = 'LAMBDA',
  GATEWAY = 'GATEWAY'
}
