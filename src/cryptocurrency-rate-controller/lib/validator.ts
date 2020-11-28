import {
  body,
  param,
  SanitizationChain,
  sanitize,
  ValidationChain,
  validationResult
} from 'express-validator';
import { StatusCode } from '../../../layers/common/nodejs/utils/common-constants';

const INVALID_SIZE_MSG = 'Size must be between 1 and 10';
const INVALID_CURR_MSG = 'Must be 3 alphanumeric uppercase characters';
const INVALID_DATE_MSG = 'Must be isISO8601 formatted';

export const applyGetExchangeRateValidationRules = (): ValidationChain[] => {
  return [validateCurr('quoteCurr'), validateDate('date'), validateCurr('baseCurr')];
};

export const applyUploadExchangeRateValidationRules = (): (
  | ValidationChain
  | SanitizationChain
)[] => {
  return [
    body('exchangeRates', INVALID_SIZE_MSG).isArray({ min: 1, max: 10 }),
    validateCurr('exchangeRates.*.quoteCurr'),
    validateDate('exchangeRates.*.date'),
    validateCurr('exchangeRates.*.baseCurr'),
    sanitize('exchangeRates.*.rate').toInt() //TODO remove sanitize as its deprecated
  ];
};

const validateCurr = (curr: string): ValidationChain =>
  param(curr, INVALID_CURR_MSG)
    .exists()
    .isLength({ min: 3, max: 3 })
    .isAlphanumeric('en-US')
    .isUppercase();

const validateDate = (date: string) => param(date, INVALID_DATE_MSG).exists().isISO8601();

export const validate = (req: Request, res, next): Response => {
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
