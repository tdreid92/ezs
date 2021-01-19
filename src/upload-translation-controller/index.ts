import { log } from '../../layers/common/nodejs/log/sam-logger';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context, Handler } from 'aws-lambda';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { config } from './lib/config';
import { lambdaEventLogger, LoggerMode } from '../../layers/common/nodejs/middleware/lambda-event-logger';
import httpSecurityHeaders from '@middy/http-security-headers';
import cors from '@middy/http-cors';
import { customHeaderAppender } from '../../layers/common/nodejs/middleware/custom-headers-appender';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import { schema } from './lib/schema';
import jsonBodyParser from '@middy/http-json-body-parser';
import { uploadDefinitionService } from './lib/upload-definition-service';
import { UploadTranslationRequest } from '../../layers/common/nodejs/models/upload-translation-request';

log.setKey(mdcKeys.functionNamespace, config.thisFunction).setKey(mdcKeys.stage, config.stageName);

const headers = {
  'Content-Type': 'application/json'
};

const handler: Handler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  const res = await uploadDefinitionService.uploadDefinition(<UploadTranslationRequest[]>(<unknown>event.body));
  return {
    body: JSON.stringify(res)
  };
};

/** Add middleware sequence to exported handler */
exports.handler = middy(handler)
  .use(doNotWaitForEmptyEventLoop({ runOnAfter: true, runOnError: true }))
  .use(jsonBodyParser())
  .use(httpErrorHandler())
  .use(validator({ inputSchema: schema }))
  .use(lambdaEventLogger({ logger: log, mode: LoggerMode.Controller }))
  .use(cors())
  .use(httpSecurityHeaders())
  .use(customHeaderAppender({ headers: headers }));
