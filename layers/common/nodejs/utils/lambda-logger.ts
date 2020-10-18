import { Logger } from 'lambda-logger-node';

export const logger = Logger({
  minimumLogLevel: 'DEBUG'
});
// export const getLambdaLogger = () => {
//   if (logger == null) {
//     logger = Logger({
//       minimumLogLevel: 'INFO'
//     });
//     console.log(process.env.AWS_LAMBDA_FUNCTION_NAME);
//     logger.setKey('Lambda', process.env.AWS_EXECUTION_ENV);
//   }
//   return logger;
// };
