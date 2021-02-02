import { log } from '../../layers/common/nodejs/log/sam-logger';
import { mdcKeys } from '../../layers/common/nodejs/log/log-constants';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { service } from './lib/service';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { config } from './lib/config';
import { PayloadRequest, PayloadResponse } from '../../layers/common/nodejs/models/invoker/payload';
import { eventLogger, LoggerMode } from '../../layers/common/nodejs/log/event-logger';
import { DatabaseRequest, DatabaseResponse } from '../../layers/common/nodejs/models/database-request';

log.setKey(mdcKeys.functionNamespace, config.thisFunctionNamespace).setKey(mdcKeys.stage, config.stage);

export const handler: middy.Middy<PayloadRequest<DatabaseRequest>, PayloadResponse<DatabaseResponse>> = middy(
  service.handle
);

exports.handler = handler
  .use(doNotWaitForEmptyEventLoop({ runOnBefore: true, runOnAfter: true, runOnError: false }))
  .use(httpErrorHandler({ logger: undefined }))
  .use(eventLogger({ logger: log, mode: LoggerMode.Lambda }));

{"vault":{"data":"af4oNmxRZlPF1LhElP6fVpMzi4Bod55SXGReMVetWMBm0NyWEzLSNFiLmvzs3Tfx/V9oswL8amn6WlD0tI7U3YaUoRt48qBgKO+fNhlawUhcRDrdsyF4yxQRMBEU6HOcolr6yppqr5m2menltA+MTL83ps/IgN4fg7mFXZHCytbCqOK8ATvS/kSXx0B4U8IO7c2VrWdhCSYPk3IcrTCTag7Y2m72bAcQGCKAeKuyHVD1ckh1pVaRbAoJ8N4VoFcn2m0X7en29h/m569vTNjkfsKAek/HasyXVFTUUxSn31eKncoU5fxhG2oToAxxHbeULWfU0haG+b2uggBu4PRlFkjSw0aPHPmtFtyE0N3PRDJeaVAdz5CZqDGQ6/RKxcQ4qkFZkKTEZ4ITZGZvbjszV8wfECgr8nzY8dHycUeuD9Htwe9yHCpZ28zcSWlE3A3BFlJk0Kv5z01BgK1yWR8ReiVUqAYlsWzWZ/OhKhPz7OKPikOaOrkJ4nFRI0czin9ouCaUNs/ACxYBVfJfQbMQDslsDZy1Tv5NahCQxJmPQ4gIkUm/y7CzQnOo7jMuY/uJ5ltJIuZdH1w39SwX1ZQADostU+99qJXtx6ED6E4GQCFQz4yXhm7pvbWpp5aZM0PbuFWDLHW0D7+z7VJfkgewk2GnDCVNJSLSaqr5izwCCkPZVgIiAjLKHBNZsX+Mw3B4ikntPQQ3PLqUkW94SmpjwtR+L9kNdRc4Plq8GT8vfkVEyo0PMgDY6M+RRvTKoo4XKZEiXYj+x93nlkxwz90d0K6y3s302ohO7Q=="},"salt":"gU2djCTc0KQwVjvglJ47QoU+E0b/W7bwqlfcEhZj/+A="}"
