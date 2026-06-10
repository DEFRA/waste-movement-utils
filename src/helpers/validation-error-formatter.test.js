import { validationErrorFormatter } from './validation-error-formatter.js'
import { HTTP_STATUS } from '../constants/http-status-codes.js'

describe('Error Handler', () => {
  const mockLogger = {
    error: jest.fn()
  }
  const mockResponse = ({
    errorPath = [],
    errorFieldName,
    errorType = 'any.required'
  } = {}) => ({
    details: [
      {
        message: '"carrier.organisationName" is required',
        path: errorPath,
        type: errorType,
        context: {
          label: 'carrier.organisationName',
          key: 'organisationName',
          ...(errorFieldName ? { local: { fieldName: errorFieldName } } : {})
        }
      }
    ],
    isBoom: true,
    output: {
      statusCode: HTTP_STATUS.BAD_REQUEST
    }
  })

  it('should format default validation errors correctly', async () => {
    const response = validationErrorFormatter(
      mockResponse({ errorPath: ['carrier', 'organisationName'] }),
      mockLogger
    )

    expect(response).toEqual({
      validation: {
        errors: [
          {
            key: 'carrier.organisationName',
            errorType: 'NotProvided',
            message: '"carrier.organisationName" is required'
          }
        ]
      }
    })

    expect(mockLogger.error).toHaveBeenCalledWith(
      { err: response.validation.errors },
      `Validation failed ${JSON.stringify(response.validation.errors)}`
    )
  })

  it('should format schema-level custom validation errors correctly', async () => {
    const response = validationErrorFormatter(
      mockResponse({ errorFieldName: 'organisationName' }),
      mockLogger
    )

    expect(response).toEqual({
      validation: {
        errors: [
          {
            key: 'organisationName',
            errorType: 'NotProvided',
            message: '"carrier.organisationName" is required'
          }
        ]
      }
    })

    expect(mockLogger.error).toHaveBeenCalledWith(
      { err: response.validation.errors },
      `Validation failed ${JSON.stringify(response.validation.errors)}`
    )
  })

  it('should format label fallback validation errors correctly', async () => {
    const response = validationErrorFormatter(mockResponse(), mockLogger)

    expect(response).toEqual({
      validation: {
        errors: [
          {
            key: 'carrier.organisationName',
            errorType: 'NotProvided',
            message: '"carrier.organisationName" is required'
          }
        ]
      }
    })

    expect(mockLogger.error).toHaveBeenCalledWith(
      { err: response.validation.errors },
      `Validation failed ${JSON.stringify(response.validation.errors)}`
    )
  })

  it('should log unexpected errors', async () => {
    const mockedResponse = mockResponse({ errorType: 'an.unexpected.error' })

    const response = validationErrorFormatter(mockedResponse, mockLogger)

    expect(response).toEqual({
      validation: {
        errors: [
          {
            key: 'carrier.organisationName',
            errorType: 'UnexpectedError',
            message: '"carrier.organisationName" is required'
          }
        ]
      }
    })

    expect(mockLogger.error).toHaveBeenCalledWith(
      {
        validationErrors: response.validation.errors,
        unexpectedErrors: mockedResponse.details,
        totalErrors: response.validation.errors.length,
        unexpectedCount: mockedResponse.details.length
      },
      `Validation failed with unexpected error types, mapped to UnexpectedError`
    )
  })
})
