import express, { Express, Response } from 'express';
import { ExchangeRatePair, HttpStatus } from '../../../layers/common/nodejs/utils/common-constants';
import bodyParser from 'body-parser';
import {
  applyGetExchangeRateValidationRules,
  applyUploadExchangeRateValidationRules,
  validate
} from './validator';
import { apiLogInterceptor } from '../../../layers/common/nodejs/utils/lambda-logger';
import { service } from './service';

const headers = {
  'Content-Type': 'application/json'
};

const bodyParserOptions = bodyParser.urlencoded({
  extended: true
});

export const app: Express = express();

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParserOptions); // to support URL-encoded bodies
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
// app.use(apiLogInterceptor);

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
    res
      .set(headers)
      .status(HttpStatus.Success)
      .send(
        await service.getExchangeRate({
          baseCurr: req.params.baseCurr,
          date: req.params.date,
          quoteCurr: req.params.quoteCurr
        })
      );
  }
);

app.get('/exchangerate/list', async (req, res: Response) => {
  res
    .set(headers)
    .status(HttpStatus.Success)
    .send(await service.listExchangeRates());
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
    res
      .set(headers)
      .status(HttpStatus.Success)
      .send(await service.putExchangeRates(req.body.exchangeRates));
  }
);
