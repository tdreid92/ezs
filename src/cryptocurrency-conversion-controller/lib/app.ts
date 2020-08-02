import express from 'express';
import { getRate } from './core-service';
export const app = express();

app.get(
  '/cryptocurrency/exchangerate/:fromCurr/:toCurr',
  async (
    req: { params: { fromCurr: string; toCurr: string } },
    res: { send: (rate: any, statusCode: number) => void }
  ) => {
    const fromCurr = req.params.fromCurr.toLowerCase();
    const toCurr = req.params.toCurr.toLowerCase();
    const rate = await getRate(fromCurr, toCurr);
    res.send(rate, 200);
  }
);

// Export your Express configuration so that it can be consumed by the Lambda handler
