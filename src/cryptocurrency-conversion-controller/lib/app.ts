import express from 'express';
export const app = express();

app.get(
  '/cryptocurrency/exchangerate/:fromCurr/:toCurr',
  async (
    req: { params: { fromCurr: string; toCurr: string } },
    res: { send: (fromCurr: string, toCurr: string, number: number) => void }
  ) => {
    const fromCurr = req.params.fromCurr.toLowerCase();
    const toCurr = req.params.toCurr.toLowerCase();
    res.send(fromCurr, toCurr, 200);
  }
);

// Export your Express configuration so that it can be consumed by the Lambda handler
