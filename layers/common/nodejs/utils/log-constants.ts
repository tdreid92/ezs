export const loggerKeys = {
  durationMs: 'duration_ms',
  requestBody: 'request.body',
  requestMethod: 'request.method',
  requestPath: 'request.path',
  responseBody: 'response.body',
  functionNamespace: 'functionNamespace',
  resource: 'resource',
  dbQuery: 'db.query',
  dbResult: 'db.result',
  dbDurationMs: 'db.duration_ms',
  invocationRequest: 'invocation.request',
  invocationResponse: 'invocation.response',
  invocationDurationMs: 'invocation.duration_ms',
  category: 'category'
};

export const loggerMessages = {
  start: 'Request Started',
  complete: 'Request Completed'
};

export const enum subLogger {
  API = 'API',
  DATABASE = 'Database',
  LAMBDA = 'Lambda',
  INVOCATION = 'Invocation'
}
