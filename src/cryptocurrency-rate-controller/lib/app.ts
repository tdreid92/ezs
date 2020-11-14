import express from 'express';
import { getExchangeRate, uploadExchangeRate } from './core-service';
import {
  FunctionNamespace,
  ExchangeRate,
  StatusCode
} from '../../../layers/common/nodejs/utils/common-constants';
export const app = express();
import bodyParser from 'body-parser';
import { applyGetRateValidationRules, applyUploadRateValidationRules, validate } from './validator';

const headers = {
  'Content-Type': 'application/json'
};

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  // to support URL-encoded bodies
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.get(
  '/cryptocurrency/exchangerate/:baseCurr/:date/:quoteCurr',
  applyGetRateValidationRules(),
  validate,
  async (
    req: {
      params: {
        baseCurr: string;
        date: string;
        quoteCurr: string;
      };
    },
    res
  ) => {
    console.info('START Request: %j', req.params);
    console.time(FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER + '-GET-RATE');

    const response = await getExchangeRate({
      baseCurr: req.params.baseCurr,
      date: req.params.date,
      quoteCurr: req.params.quoteCurr
    });

    console.timeEnd(FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER + '-GET-RATE');
    res.set(headers).status(StatusCode.success).send(response);
  }
);

app.post(
  '/cryptocurrency/exchangerate',
  applyUploadRateValidationRules(),
  validate,
  async (
    req: {
      body: {
        baseCurr: string;
        date: string;
        quoteCurr: string;
        rate: number;
      };
    },
    res
  ) => {
    console.info('START Request: %j', req.body);
    console.time(FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER + '-UPLOAD-RATE');

    const rate: ExchangeRate = req.body;
    const response = await uploadExchangeRate(rate);

    console.timeEnd(FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER + '-UPLOAD-RATE');
    res.set(headers).status(StatusCode.success).send(response);
  }
);
