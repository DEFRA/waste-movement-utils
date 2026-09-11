import { ProblemDetails } from './problem-details.js'

describe('ProblemDetails', () => {
  describe('constructor', () => {
    it('defaults type to "about:blank" when not provided', () => {
      const pd = new ProblemDetails({ title: 'Bad Request', status: 400 })
      expect(pd.type).toBe('about:blank')
    })

    it('uses the provided type when given', () => {
      const pd = new ProblemDetails({
        type: 'https://example.com/errors/bad-request',
        title: 'Bad Request',
        status: 400
      })
      expect(pd.type).toBe('https://example.com/errors/bad-request')
    })

    it('sets title and status', () => {
      const pd = new ProblemDetails({ title: 'Not Found', status: 404 })
      expect(pd.title).toBe('Not Found')
      expect(pd.status).toBe(404)
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
      expect(pd.status).toBeUndefined()
    })
  })

  describe('fromBoom', () => {
    function makeBoom({
      statusCode = 400,
      error = 'Bad Request',
      message = 'Something went wrong',
      data = null
    } = {}) {
      return {
        message,
        data,
        output: {
          statusCode,
          payload: {
            error,
            message
          }
        }
      }
    }

    it('maps statusCode, title, and detail from the Boom error', () => {
      const boomError = makeBoom({
        statusCode: 404,
        error: 'Not Found',
        message: 'Widget not found'
      })
      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd.status).toBe(404)
      expect(pd.title).toBe('Not Found')
      expect(pd.detail).toBe('Widget not found')
    })

    it('falls back to payload.message when boomError.message is falsy', () => {
      const boomError = makeBoom({ message: '' })
      boomError.output.payload.message = 'fallback message'
      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd.detail).toBe('fallback message')
    })

    it('leaves type undefined when typeBase is not provided', () => {
      const boomError = makeBoom()
      const pd = ProblemDetails.fromBoom(boomError)
      expect(pd.type).toBe('about:blank')
    })

    it('builds type from typeBase and a slugified error code', () => {
      const boomError = makeBoom({ error: 'Not Found' })
      const pd = ProblemDetails.fromBoom(boomError, {
        typeBase: 'https://api.example.com/errors/'
      })
      expect(pd.type).toBe('https://api.example.com/errors/not-found')
    })

    it('uses "error" as the code fallback when payload.error is missing', () => {
      const boomError = makeBoom()
      boomError.output.payload.error = undefined
      const pd = ProblemDetails.fromBoom(boomError, {
        typeBase: 'https://api.example.com/errors/'
      })
      expect(pd.type).toBe('https://api.example.com/errors/error')
    })

    it('sets instance when provided in opts', () => {
      const boomError = makeBoom()
      const pd = ProblemDetails.fromBoom(boomError, {
        instance: '/widgets/123'
      })
      expect(pd.instance).toBe('/widgets/123')
    })

    it('leaves instance unset when not provided in opts', () => {
      const boomError = makeBoom()
      const pd = ProblemDetails.fromBoom(boomError)
      expect(pd).not.toHaveProperty('instance')
    })

    it('maps Joi validation details into an errors extension by default', () => {
      const boomError = makeBoom({
        statusCode: 422,
        error: 'Unprocessable Entity'
      })
      boomError.data = {
        details: [
          { message: '"name" is required', path: ['name'] },
          { message: '"age" must be a number', path: ['age'] }
        ]
      }

      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd.errors).toEqual([
        { message: '"name" is required', path: ['name'] },
        { message: '"age" must be a number', path: ['age'] }
      ])
    })

    it('omits validation details when exposeValidation is false', () => {
      const boomError = makeBoom()
      boomError.data = {
        details: [{ message: '"name" is required', path: ['name'] }]
      }

      const pd = ProblemDetails.fromBoom(boomError, { exposeValidation: false })

      expect(pd).not.toHaveProperty('errors')
    })

    it('merges other boomError.data fields when there are no validation details', () => {
      const boomError = makeBoom()
      boomError.data = { customField: 'customValue' }

      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd.customField).toBe('customValue')
      expect(pd).not.toHaveProperty('errors')
    })

    it('does not merge extra data when boomError.data is null', () => {
      const boomError = makeBoom()
      boomError.data = null

      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd).not.toHaveProperty('errors')
      expect(pd).not.toHaveProperty('customField')
    })

    it('does not merge extra data when boomError.data is undefined', () => {
      const boomError = makeBoom()
      delete boomError.data

      const pd = ProblemDetails.fromBoom(boomError)

      expect(pd).not.toHaveProperty('errors')
    })
  })

  describe('toHapiResponse', () => {
    it('sends the instance as the body, sets status code and content type', () => {
      const pd = new ProblemDetails({ title: 'Not Found', status: 404 })

      const responseObj = {
        code: jest.fn().mockReturnThis(),
        type: jest.fn().mockReturnThis()
      }
      const h = { response: jest.fn().mockReturnValue(responseObj) }

      const result = pd.toHapiResponse(h)

      expect(h.response).toHaveBeenCalledWith(pd)
      expect(responseObj.code).toHaveBeenCalledWith(404)
      expect(responseObj.type).toHaveBeenCalledWith('application/problem+json')
      expect(result).toBe(responseObj)
    })
  })

  describe('toJSON', () => {
    it('includes type, title, status always', () => {
      const pd = new ProblemDetails({ title: 'Not Found', status: 404 })
      const json = pd.toJSON()

      expect(json).toEqual({
        type: 'about:blank',
        title: 'Not Found',
        status: 404
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
        status: 404,
        detail: 'Widget missing',
        instance: '/widgets/123'
      })
    })
  })
})
