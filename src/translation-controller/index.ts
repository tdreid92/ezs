import { log } from '../../layers/common/nodejs/log/sam-logger';
import {
  APIGatewayEvent,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
  Context,
  Handler
} from 'aws-lambda';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { config } from './lib/config';
import httpEventNormalizer from '@middy/http-event-normalizer';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpResponseSerializer from '@sharecover-co/middy-http-response-serializer';
import { FindTranslationResponse } from '../../layers/common/nodejs/models/find-translation-response';
import { lambdaLogger, LoggerMode } from '../../layers/common/nodejs/middleware/lambda-logger';
import { PayloadResponse } from '../../layers/common/nodejs/models/invoker/payload';
import httpSecurityHeaders from '@middy/http-security-headers';

log.setKey(mdcKeys.functionNamespace, config.thisFunction).setKey(mdcKeys.stage, config.stageName);

const service: Handler = async (event: APIGatewayEvent, context: Context): Promise<FindTranslationResponse> => {
  //log.info((<FindTranslationResponse>(<unknown>event.pathParameters)).body.source);
  const res: FindTranslationResponse = {
    body: JSON.stringify(event.pathParameters),
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200
  };
  return res;
};

const handler: middy.Middy<APIGatewayEvent, PayloadResponse> = middy(service);

/** Add middleware sequence to exported handler */
exports.handler = handler
  .use(doNotWaitForEmptyEventLoop({ runOnAfter: true, runOnError: true }))
  //.use(lambdaLogger({ logger: log, mode: LoggerMode.Controller }))
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  // .use(jsonBodyParser())
  // .use(customHeaderAppender({ headers: headers }))
  .use(httpSecurityHeaders());
