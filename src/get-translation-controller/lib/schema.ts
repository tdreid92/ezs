/**
 * JSON Schema Validation
 * See https://json-schema.org/draft/2019-09/json-schema-validation.html#pattern
 */
export const inputSchema = {
  properties: {
    pathParameters: {
      type: 'object',
      properties: {
        source: {
          type: 'string',
          minLength: 2,
          maxLength: 2,
          pattern: '^[A-Z]{2}$'
        },
        target: {
          type: 'string',
          minLength: 2,
          maxLength: 2,
          pattern: '^[A-Z]{2}$'
        },
        word: {
          type: 'string'
        }
      }
    }
  }
};

// export const outputSchema = {
//   properties: {
//     getTranslationResponse: {
//       type: 'object',
//       properties: {
//         source: {
//           type: 'string',
//           minLength: 2,
//           maxLength: 2,
//           pattern: '^[A-Z]{2}$'
//         },
//         target: {
//           type: 'string',
//           minLength: 2,
//           maxLength: 2,
//           pattern: '^[A-Z]{2}$'
//         },
//         // word: {
//         //   type: 'string'
//         // },
//         definition: {
//           type: 'string'
//         }
//       }
//     }
//   }
// };
