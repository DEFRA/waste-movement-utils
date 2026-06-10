import { getErrorCategory } from '../constants/validation-error-categories.js'

/**
 * Error handler to provide additional functionality for different error codes.
 *
 * @param {Object} response - Response object
 * @param {Object} logger - Logger
 *
 * @returns {Object} Response
 */
export function validationErrorFormatter(response, logger) {
  // Access the validation error details
  const validationErrors = response.details
  const unexpectedErrors = []

  // Transform validation errors to the required format
  const formattedErrors = validationErrors.map((error) => {
    const errorType = getErrorCategory(error.type)

    if (errorType === 'UnexpectedError') {
      unexpectedErrors.push(error)
    }

    // Determine the error key
    // For most errors, Joi provides the path (e.g., ['fieldName'])
    // However, custom validators at the schema level don't have path context
    let key = error.path.join('.')

    // For schema-level custom validations that pass fieldName metadata via local context,
    // use that instead of the empty path
    // This allows custom validations to specify which field the error relates to
    if (!key && error.context?.local?.fieldName) {
      key = error.context.local.fieldName
    }

    // Fallback to the label
    if (!key && error.context.label) {
      key = error.context.label
    }

    return {
      key,
      errorType,
      message: error.message
    }
  })

  // Log all validation errors in a single consolidated entry
  if (unexpectedErrors.length > 0) {
    logger.error(
      {
        validationErrors: formattedErrors,
        unexpectedErrors,
        totalErrors: formattedErrors.length,
        unexpectedCount: unexpectedErrors.length
      },
      `Validation failed with unexpected error types, mapped to UnexpectedError`
    )
  } else {
    logger.error(
      { err: formattedErrors },
      `Validation failed ${JSON.stringify(formattedErrors)}`
    )
  }

  return {
    validation: {
      errors: formattedErrors
    }
  }
}
