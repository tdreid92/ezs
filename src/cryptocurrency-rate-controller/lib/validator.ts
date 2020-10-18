import { body, check, param, ValidationChain, validationResult } from 'express-validator';

export const applyUploadRateValidationRules = () => {
  return [
    currValidation('quoteCurr'),
    body('date', 'Must be isISO8601 formatted').exists().isISO8601(),
    currValidation('baseCurr'),
    body('rate', 'Must be numeric').exists().isNumeric()
  ];
};

export const applyGetRateValidationRules = () => {
  return [
    currValidation('quoteCurr'),
    param('date', 'Must be isISO8601 formatted').exists().isISO8601(),
    currValidation('baseCurr')
  ];
};

const currValidation = (curr: string) =>
  check(curr, 'Must be 3 alphanumeric uppercase characters')
    .exists()
    .isLength({ min: 3, max: 3 })
    .isAlphanumeric('en-US')
    .isUppercase();

const dateValidation = (date: string) =>
  body(date, 'Must be isISO8601 formatted').exists().isISO8601();
//
// const rateValidation = (rate: string) => {
//   body(rate).exists().withMessage('Is required').isNumeric().withMessage('Must be numeric');
// };

export const validate = (req, res, next) => {
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

  return res.status(400).json({
    errors: extractedErrors
  });
};
