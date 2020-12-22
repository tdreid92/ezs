import express, { Express, Response } from 'express';
import bodyParser from 'body-parser';
import {
  applyGetExchangeRateValidationRules,
  applyUploadExchangeRateValidationRules,
  validate
} from './validator';
import { exchangeRateService } from './exchange-rate-service';
import { ExchangeRatePair } from '../../../layers/common/nodejs/models/exchange-rate-pair';

// const headers = {
//   'Content-Type': 'application/json',
//   'Access-Control-Allow-Origin': '*' // required for CORS and AWS API Gateway Proxy integration
// };

const bodyParserOptions = bodyParser.urlencoded({
  extended: true
});

export const app: Express = express();
3;

app.use(bodyParser.json()); // supports JSON-encoded bodies
app.use(bodyParserOptions); // supports URL-encoded bodies
app.use(express.json()); // supports JSON-encoded bodies
app.use(express.urlencoded()); // supports URL-encoded bodies

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
  ): Promise<void> => {
    const payloadResponse = await exchangeRateService.getExchangeRate({
      baseCurr: req.params.baseCurr,
      date: req.params.date,
      quoteCurr: req.params.quoteCurr
    });
    res.status(payloadResponse.statusCode).send({ payload: payloadResponse.body });
  }
);

app.get(
  '/exchangerate/list',
  async (req, res: Response): Promise<void> => {
    const payloadResponse = await exchangeRateService.listExchangeRates();
    res.status(payloadResponse.statusCode).send({ payload: payloadResponse.body });
  }
);

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
  ): Promise<void> => {
    const payloadResponse = await exchangeRateService.putExchangeRates(req.body.exchangeRates);
    res.status(payloadResponse.statusCode).send({ payload: payloadResponse.body });
  }
);
