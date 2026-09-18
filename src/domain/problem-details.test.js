import Joi from 'joi'
import {
  badData,
  badRequest,
  boomify,
  internal,
  notFound,
  unauthorized
} from '@hapi/boom'
import { ProblemDetails } from './problem-details.js'

const buildHapiStyleValidationBoom = (schema, payload) => {
  const { error: joiError } = schema.validate(payload, { abortEarly: false })

  if (!joiError) {
    throw new Error('Test setup error: payload was valid, expected a Joi error')
  }

  const boomError = boomify(joiError, { statusCode: 400 })

  return boomError
}

describe('ProblemDetails', () => {
  describe('constructor', () => {
    it('defaults type to "about:blank" when not provided', () => {
      const pd = new ProblemDetails({ title: 'Bad Request', status: 400 })
      expect(pd.type).toBe('about:blank')
    })

    it('uses the provided type when given', () => {
      const pd = new ProblemDetails({
        type: 'https://waste-tracking.service.gov.uk/problems/bad-request',
        title: 'Bad Request',
        status: 400
      })
      expect(pd.type).toBe(
        'https://waste-tracking.service.gov.uk/problems/bad-request'
      )
    })

    it('sets title and status', () => {
      const pd = new ProblemDetails({ title: 'Not Found', status: 404 })
      expect(pd.title).toBe('Not Found')
    })

    it('omits detail when not provided', () => {
      const pd = new ProblemDetails({ title: 'Not Found', status: 404 })
      expect(pd).not.toHaveProperty('detail')
    })

    it('sets detail when provided', () => {
      const pd = new ProblemDetails({
        title: 'Not Found',
        status: 404,
        detail: 'Widget 123 does not exist'
      })
      expect(pd.detail).toBe('Widget 123 does not exist')
    })

    it('omits instance when not provided', () => {
      const pd = new ProblemDetails({ title: 'Not Found', status: 404 })
      expect(pd).not.toHaveProperty('instance')
    })

    it('sets instance when provided', () => {
      const pd = new ProblemDetails({
        title: 'Not Found',
        status: 404,
        instance: '/widgets/123'
      })
      expect(pd.instance).toBe('/widgets/123')
    })

    it('merges extensions onto the instance', () => {
      const pd = new ProblemDetails({
        title: 'Validation Error',
        status: 422,
        extensions: { errors: [{ message: 'required', path: ['name'] }] }
      })
      expect(pd.errors).toEqual([{ message: 'required', path: ['name'] }])
    })

    it('defaults extensions to an empty object when not provided', () => {
      const pd = new ProblemDetails({ title: 'Not Found', status: 404 })
      expect(pd.title).toBe('Not Found')
    })

    it('handles being called with no arguments at all', () => {
      const pd = new ProblemDetails()
      expect(pd.type).toBe('about:blank')
      expect(pd.title).toBeUndefined()
    })
  })

  describe('fromBoom', () => {
    it('maps statusCode, title, and detail from the Boom error', () => {
      const boomError = notFound('Widget not found')

      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd.title).toBe('Not Found')
      expect(pd.detail).toBe('Widget not found')
    })

    it('leaves type undefined when typeBase is not provided', () => {
      const boomError = badRequest('Something went wrong')
      const pd = ProblemDetails.fromBoom(boomError)
      expect(pd.type).toBe('about:blank')
    })

    it('builds type from typeBase and a slugified error code', () => {
      const boomError = notFound('')
      const pd = ProblemDetails.fromBoom(boomError, {
        typeBase: 'https://waste-tracking.service.gov.uk/problems/errors/'
      })
      expect(pd.type).toBe(
        'https://waste-tracking.service.gov.uk/problems/errors/not-found'
      )
    })

    it('uses "error" as the code fallback when payload.error is missing', () => {
      const boomError = notFound('Not Found')
      boomError.output.payload.error = undefined
      const pd = ProblemDetails.fromBoom(boomError, {
        typeBase: 'https://waste-tracking.service.gov.uk/problems/errors/'
      })
      expect(pd.type).toBe(
        'https://waste-tracking.service.gov.uk/problems/errors/error'
      )
    })

    it('sets instance when provided in opts', () => {
      const boomError = badRequest('Something went wrong')
      const pd = ProblemDetails.fromBoom(boomError, {
        instance: '/widgets/123'
      })
      expect(pd.instance).toBe('/widgets/123')
    })

    it('leaves instance unset when not provided in opts', () => {
      const boomError = badRequest('Something went wrong')
      const pd = ProblemDetails.fromBoom(boomError)
      expect(pd).not.toHaveProperty('instance')
    })

    it('maps badData details into an errors extension by default', () => {
      const boomError = badData('Unprocessable Entity', {
        details: [
          {
            message: '"name" is required',
            path: ['path', 'to', 'name'],
            type: 'any.required'
          },
          {
            message: '"age" must be a number',
            path: ['path', 'to', 'age'],
            type: 'any.number'
          }
        ]
      })

      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd.errors).toEqual([
        {
          message: '"name" is required',
          pointer: '/path/to/name',
          errorType: 'any.required'
        },
        {
          message: '"age" must be a number',
          pointer: '/path/to/age',
          errorType: 'any.number'
        }
      ])
    })

    it('omits badData details when exposeValidation is false', () => {
      const boomError = badData('Unprocessable Entity', {
        details: [
          {
            message: '"name" is required',
            path: ['path', 'to', 'name'],
            type: 'any.required'
          },
          {
            message: '"age" must be a number',
            path: ['path', 'to', 'age'],
            type: 'any.number'
          }
        ]
      })

      const pd = ProblemDetails.fromBoom(boomError, { exposeValidation: false })

      expect(pd).not.toHaveProperty('errors')
    })

    it('maps Joi validation details into an errors extension by default', () => {
      const schema = Joi.object({
        person: {
          name: Joi.string().required(),
          age: Joi.number().required()
        }
      })
      const boomError = buildHapiStyleValidationBoom(schema, {
        person: { age: 'old' }
      })

      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd.errors).toEqual([
        {
          message: '"person.name" is required',
          pointer: '/person/name',
          errorType: 'any.required'
        },
        {
          message: '"person.age" must be a number',
          pointer: '/person/age',
          errorType: 'number.base'
        }
      ])
    })

    it('omits validation details when exposeValidation is false', () => {
      const schema = Joi.object({
        person: {
          name: Joi.string().required(),
          age: Joi.number().required()
        }
      })
      const boomError = buildHapiStyleValidationBoom(schema, {
        person: { age: 'old' }
      })

      const pd = ProblemDetails.fromBoom(boomError, {
        exposeValidation: false
      })

      expect(pd).not.toHaveProperty('errors')
    })

    it('ignores malformed validation details', () => {
      const boomError = badData('Unprocessable Entity', {
        details: [{ message: 'Missing a path and error type' }]
      })

      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd).not.toHaveProperty('errors')
    })

    it('returns boomified errors shape', () => {
      const boomError = boomify(new Error('A standard Error Boomified'))

      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd).toEqual({
        type: 'about:blank',
        title: 'Internal Server Error'
      })
    })

    it('doesnt merge other boomError.data fields when there are no validation details', () => {
      const boomError = badData('Unprocessable Entity', {
        customField: 'customValue'
      })

      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd).not.toHaveProperty('customField')
      expect(pd).not.toHaveProperty('errors')
    })

    it('does not merge extra data when boomError.data is null', () => {
      const boomError = badData('Unprocessable Entity', null)

      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd).not.toHaveProperty('errors')
      expect(pd).not.toHaveProperty('customField')
    })

    it('does not merge extra data when boomError.data is undefined', () => {
      const boomError = badData('Unprocessable Entity')

      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd).not.toHaveProperty('errors')
    })

    it('keeps internal error messages private', async () => {
      const boomError = internal('database password=secret')

      const pd = ProblemDetails.fromBoom(boomError)

      expect(JSON.stringify(pd)).not.toContain('password=secret')
    })
  })

  describe('toHapiResponse', () => {
    const responseObj = {
      header: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis()
    }

    it('sends the instance as the body, sets status code and content type', () => {
      const pd = new ProblemDetails({ title: 'Not Found', status: 404 })

      const h = { response: jest.fn().mockReturnValue(responseObj) }

      const result = pd.toHapiResponse(h)

      expect(h.response).toHaveBeenCalledWith(pd)
      expect(responseObj.code).toHaveBeenCalledWith(404)
      expect(responseObj.header).not.toHaveBeenCalled()
      expect(responseObj.type).toHaveBeenCalledWith('application/problem+json')
      expect(result).toBe(responseObj)
    })

    it('sends the instance as the body, sets x-request-id header, status code and content type', () => {
      const requestId = 'RequestID'

      const boomError = badRequest('Something went wrong')

      const pd = ProblemDetails.fromBoom(boomError, { requestId })

      const h = { response: jest.fn().mockReturnValue(responseObj) }

      const result = pd.toHapiResponse(h)

      expect(h.response).toHaveBeenCalledWith(pd)
      expect(responseObj.header).toHaveBeenCalledWith('x-request-id', requestId)
      expect(responseObj.code).toHaveBeenCalledWith(400)
      expect(responseObj.type).toHaveBeenCalledWith('application/problem+json')
      expect(result).toBe(responseObj)
    })

    it('preserves headers from incoming response', () => {
      const boomError = unauthorized('Token expired', 'Bearer')

      const pd = ProblemDetails.fromBoom(boomError)
      const h = { response: jest.fn().mockReturnValue(responseObj) }

      pd.toHapiResponse(h)

      expect(h.response).toHaveBeenCalledWith(pd)
      expect(responseObj.code).toHaveBeenCalledWith(401)
      expect(responseObj.header).toHaveBeenCalledTimes(1)
      expect(responseObj.header).toHaveBeenCalledWith(
        'WWW-Authenticate',
        'Bearer error="Token expired"'
      )
      expect(responseObj.type).toHaveBeenCalledWith('application/problem+json')
    })
  })

  describe('toJSON', () => {
    it('includes type, title, status always', () => {
      const pd = new ProblemDetails({ title: 'Not Found', status: 404 })
      const json = pd.toJSON()

      expect(json).toEqual({
        type: 'about:blank',
        title: 'Not Found'
      })
    })

    it('includes detail when present', () => {
      const pd = new ProblemDetails({
        title: 'Not Found',
        status: 404,
        detail: 'Widget missing'
      })
      const json = pd.toJSON()

      expect(json.detail).toBe('Widget missing')
    })

    it('excludes detail when absent', () => {
      const pd = new ProblemDetails({ title: 'Not Found', status: 404 })
      const json = pd.toJSON()

      expect(json).not.toHaveProperty('detail')
    })

    it('includes instance when present', () => {
      const pd = new ProblemDetails({
        title: 'Not Found',
        status: 404,
        instance: '/widgets/123'
      })
      const json = pd.toJSON()

      expect(json.instance).toBe('/widgets/123')
    })

    it('excludes instance when absent', () => {
      const pd = new ProblemDetails({ title: 'Not Found', status: 404 })
      const json = pd.toJSON()

      expect(json).not.toHaveProperty('instance')
    })

    it('spreads extension properties into the output', () => {
      const pd = new ProblemDetails({
        title: 'Validation Error',
        status: 422,
        extensions: { errors: [{ message: 'required' }] }
      })
      const json = pd.toJSON()

      expect(json.errors).toEqual([{ message: 'required' }])
    })

    it('produces JSON.stringify-safe output via JSON.stringify integration', () => {
      const pd = new ProblemDetails({
        title: 'Not Found',
        status: 404,
        detail: 'Widget missing',
        instance: '/widgets/123'
      })

      const serialized = JSON.stringify(pd)
      const parsed = JSON.parse(serialized)

      expect(parsed).toEqual({
        type: 'about:blank',
        title: 'Not Found',
        detail: 'Widget missing',
        instance: '/widgets/123'
      })
    })
  })
})
