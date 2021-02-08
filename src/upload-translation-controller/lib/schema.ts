/**
 * JSON Schema Validation
 * See https://json-schema.org/draft/2019-09/json-schema-validation.html#pattern
 */
export const schema = {
  properties: {
    body: {
      type: 'object',
      properties: {
        translations: {
          type: 'array',
          maxItems: 2,
          minItems: 1,
          items: {
            type: 'object',
            required: ['source', 'target', 'word', 'content'],
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
                pattern: '^[A-Z]{2}$'
              },
              word: {
                type: 'string'
              },
              content: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  }
};
