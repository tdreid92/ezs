export const mdcKey = {
  // general bucket
  traceId: 'traceId',
  traceIndex: 'traceIndex',
  date: 'date',
  appName: 'appName',
  version: 'version',
  durationMs: 'duration_ms',
  functionNamespace: 'functionNamespace',
  resource: 'resource',

  // request bucket
  requestBody: 'request.body',
  requestMethod: 'request.method',
  requestPath: 'request.path',

  // response bucket
  responseBody: 'response.body',
  responseStatusCode: 'response.statusCode',

  // database bucket
  dbQuery: 'db.query',
  dbResult: 'db.result',
  dbDurationMs: 'db.duration_ms',

  // invocation bucket
  invocationRequest: 'invocation.request',
  invocationResponse: 'invocation.response',
  invocationDurationMs: 'invocation.duration_ms',

  // error bucket
  errorName: 'error.name',
  errorMessage: 'error.message',
  errorStacktrace: 'error.stacktrace'
};

export const loggerMessages = {
  start: 'Request Started',
  complete: 'Request Completed',
  failed: 'Request failed'
};

export const enum subLogger {
  API = 'API',
  DATABASE = 'Database',
  LAMBDA = 'Lambda',
  INVOCATION = 'Invocation'
}
