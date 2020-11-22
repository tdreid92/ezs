import express from 'express';
import { getExchangeRate, listExchangeRates, putExchangeRates } from './core-service';
import {
  ExchangeRatePair,
  FunctionNamespace,
  StatusCode
} from '../../../layers/common/nodejs/utils/common-constants';
import bodyParser from 'body-parser';
import {
  applyGetExchangeRateValidationRules,
  applyUploadExchangeRateValidationRules,
  validate
} from './validator';
import { Request, Response } from 'express';
export const app = express();

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
  '/exchangerate/:baseCurr/:date/:quoteCurr',
  applyGetExchangeRateValidationRules(),
  validate,
  async (
    req: {
      params: {
        baseCurr: string;
        date: string;
        quoteCurr: string;
      };
    },
    res: Response
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

app.get('/exchangerate/list', async (req, res) => {
  console.info('START Request: %j');
  console.time(FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER + '-LIST-RATE');

  const response = await listExchangeRates();
  console.timeEnd(FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER + '-LIST-RATE');
  res.set(headers).status(StatusCode.success).send(response);
});

app.post(
  '/exchangerate',
  applyUploadExchangeRateValidationRules(),
  validate,
  async (
    req: {
      body: {
        exchangeRates: ExchangeRatePair[];
      };
    },
    res: Response
  ) => {
    console.info('START Request: %j', req.body);
    console.time(FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER + '-PUT-RATES');

    const response = await putExchangeRates(req.body.exchangeRates);

    console.timeEnd(FunctionNamespace.CRYPTOCURRENCY_RATE_CONTROLLER + '-PUT-RATES');
    res.set(headers).status(StatusCode.success).send(response);
  }
);
