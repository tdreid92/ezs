import { body, param, sanitize, validationResult } from 'express-validator';
import { StatusCode } from '../../../layers/common/nodejs/utils/common-constants';
import { NextFunction } from 'express';

const INVALID_SIZE_MSG = 'Size must be between 1 and 10';
const INVALID_CURR_MSG = 'Must be 3 alphanumeric uppercase characters';
const INVALID_DATE_MSG = 'Must be isISO8601 formatted';

export const applyGetExchangeRateValidationRules = () => {
  return [validateCurr('quoteCurr'), validateDate('date'), validateCurr('baseCurr')];
};

export const applyUploadExchangeRateValidationRules = () => {
  return [
    body('exchangeRates', INVALID_SIZE_MSG).isArray({ min: 1, max: 10 }),
    validateCurr('exchangeRates.*.quoteCurr'),
    validateDate('exchangeRates.*.date'),
    validateCurr('exchangeRates.*.baseCurr'),
    sanitize('exchangeRates.*.rate').toInt() //TODO remove sanitize as its deprecated
  ];
};

const validateCurr = (curr: string) =>
  param(curr, INVALID_CURR_MSG)
    .exists()
    .isLength({ min: 3, max: 3 })
    .isAlphanumeric('en-US')
    .isUppercase();

const validateDate = (date: string) => param(date, INVALID_DATE_MSG).exists().isISO8601();

export const validate = (req: Request, res, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors: string[] = [];
  errors.array().map((err) =>
    extractedErrors.push({
      [err.param]: err.msg
    } as any)
  );

  return res.status(StatusCode.badRequest).json({
    errors: extractedErrors
  });
};
