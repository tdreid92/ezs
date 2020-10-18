import express from 'express';
import { getRate, uploadRate } from './core-service';
import {
  FunctionNamespace,
  ExchangeRatePair
} from '../../../layers/common/nodejs/utils/common-constants';
export const app = express();
import bodyParser from 'body-parser';
import { applyGetRateValidationRules, applyUploadRateValidationRules, validate } from './validator';

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

    const baseCurr = req.params.baseCurr;
    const quoteCurr = req.params.quoteCurr;
    const date = req.params.date;

    const rate = await getRate(baseCurr, quoteCurr, date);
    console.timeEnd(FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER + '-GET-RATE');
    res
      .set({
        'Content-Type': 'text/plain'
      })
      .status(200)
      .send(rate);
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
    const ratePair: ExchangeRatePair = req.body;
    const uploadRateResponse = await uploadRate(ratePair);
    console.timeEnd(FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER + '-UPLOAD-RATE');
    res
      .set({
        'Content-Type': 'text/plain'
      })
      .status(200)
      .send(uploadRateResponse);
  }
);
