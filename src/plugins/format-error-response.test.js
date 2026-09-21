import { formatErrorToRFC9457Response } from './format-error-response.js'
import { ProblemDetails } from '../domain/problem-details.js'

describe('problem-details-error-formatter plugin', () => {
  let server
  let extHandler
  let h

  const mockedResponse = {
    header: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis(),
    type: jest.fn().mockReturnThis()
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    server = { ext: jest.fn() }
    await formatErrorToRFC9457Response.plugin.register(server, {
      shouldFormat: () => true
    })
    extHandler = server.ext.mock.calls[0][1]

    h = {
      response: jest.fn().mockReturnValue(mockedResponse),
      continue: Symbol('continue')
    }
  })

  it('registers a single onPreResponse extension', () => {
    expect(server.ext).toHaveBeenCalledTimes(1)
    expect(server.ext).toHaveBeenCalledWith(
      'onPreResponse',
      expect.any(Function)
    )
  })

  it('passes through by default when no shouldFormat option is provided', () => {
    const defaultServer = { ext: jest.fn() }
    const request = {
      response: { isBoom: true },
      path: '/beta-1/widgets'
    }

    formatErrorToRFC9457Response.plugin.register(defaultServer)
    const defaultHandler = defaultServer.ext.mock.calls[0][1]

    expect(defaultHandler(request, h)).toBe(h.continue)
  })

  it('formats and logs a Boom error when shouldFormat returns true', async () => {
    const logger = { error: jest.fn() }
    const getTraceId = jest.fn()
    const response = {
      isBoom: true,
      output: { statusCode: '404', payload: { error: 'Some Error' } }
    }
    const request = {
      response,
      getTraceId,
      logger,
      path: '/widgets'
    }
    const fromBoomSpy = jest.spyOn(ProblemDetails, 'fromBoom')
    const result = await extHandler(request, h)

    expect(fromBoomSpy).toHaveBeenCalledWith(response, {
      instance: request.path,
      typeBase: 'https://waste-tracking.service.gov.uk/problems/'
    })
    expect(mockedResponse.header).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledWith(
      {
        instance: '/widgets',
        title: 'Some Error',
        type: 'https://waste-tracking.service.gov.uk/problems/some-error'
      },
      'Some Error'
    )
    expect(result).toBe(mockedResponse)
  })

  it('formats and logs a Boom error with a requestId when shouldFormat returns true', async () => {
    const logger = { error: jest.fn() }
    const getTraceId = jest.fn()
    const response = {
      isBoom: true,
      output: { statusCode: '404', payload: { error: 'Some Error' } }
    }
    const request = {
      response,
      getTraceId,
      logger,
      path: '/widgets'
    }
    const traceId = 'Trace-Id'
    getTraceId.mockReturnValue(traceId)

    const result = await extHandler(request, h)
    const fromBoomSpy = jest.spyOn(ProblemDetails, 'fromBoom')

    expect(fromBoomSpy).toHaveBeenCalledWith(response, {
      instance: request.path,
      typeBase: 'https://waste-tracking.service.gov.uk/problems/',
      requestId: traceId
    })
    expect(mockedResponse.header).toHaveBeenCalledWith('x-request-id', traceId)
    expect(logger.error).toHaveBeenCalledWith(
      {
        instance: '/widgets',
        requestId: 'Trace-Id',
        title: 'Some Error',
        type: 'https://waste-tracking.service.gov.uk/problems/some-error'
      },
      'Some Error'
    )
    expect(result).toBe(mockedResponse)
  })

  it('passes through when the response is not a Boom error', async () => {
    const request = {
      response: { isBoom: false },
      logger: { error: jest.fn() },
      path: '/widgets'
    }

    const result = await extHandler(request, h)

    expect(ProblemDetails.fromBoom).not.toHaveBeenCalled()
    expect(result).toBe(h.continue)
  })

  it('uses a custom shouldFormat option when provided, calling it with the request', async () => {
    const shouldFormat = jest.fn().mockReturnValue(true)
    const customServer = { ext: jest.fn() }
    const response = {
      isBoom: true,
      output: { statusCode: '404', payload: { error: 'Some Error' } }
    }
    const request = {
      response,
      getTraceId: jest.fn(),
      logger: { error: jest.fn() },
      path: '/widgets'
    }

    formatErrorToRFC9457Response.plugin.register(customServer, {
      shouldFormat
    })
    const customHandler = customServer.ext.mock.calls[0][1]

    const result = customHandler(request, h)

    expect(shouldFormat).toHaveBeenCalledWith(request)
    expect(ProblemDetails.fromBoom).toHaveBeenCalledWith(response, {
      instance: request.path,
      typeBase: 'https://waste-tracking.service.gov.uk/problems/'
    })
    expect(result).toBe(mockedResponse)
  })

  it('passes through when a custom shouldFormat option returns false', async () => {
    const customServer = { ext: jest.fn() }
    const request = {
      response: { isBoom: true },
      path: '/widgets'
    }

    formatErrorToRFC9457Response.plugin.register(customServer, {
      shouldFormat: () => false
    })
    const customHandler = customServer.ext.mock.calls[0][1]

    const result = customHandler(request, h)

    expect(ProblemDetails.fromBoom).not.toHaveBeenCalled()
    expect(result).toBe(h.continue)
  })

  it('makes shouldFormat decisions on a per-request basis using the request path', async () => {
    const shouldFormat = (request) => request.path.startsWith('/v2')
    const customServer = { ext: jest.fn() }

    formatErrorToRFC9457Response.plugin.register(customServer, {
      shouldFormat
    })
    const customHandler = customServer.ext.mock.calls[0][1]

    const v1Request = {
      response: { isBoom: true },
      path: '/v1/widgets'
    }
    const v2Request = {
      response: {
        isBoom: true,
        output: { statusCode: '404', payload: { error: 'Some Error' } }
      },
      getTraceId: jest.fn(),
      logger: { error: jest.fn() },
      path: '/v2/widgets'
    }

    expect(customHandler(v1Request, h)).toBe(h.continue)
    expect(ProblemDetails.fromBoom).not.toHaveBeenCalled()

    const result = customHandler(v2Request, h)

    expect(ProblemDetails.fromBoom).toHaveBeenCalledWith(v2Request.response, {
      instance: v2Request.path,
      typeBase: 'https://waste-tracking.service.gov.uk/problems/'
    })
    expect(result).toBe(mockedResponse)
  })

  it('uses a custom typeBase option when provided', async () => {
    const customServer = { ext: jest.fn() }
    const response = {
      isBoom: true,
      output: { statusCode: '404', payload: { error: 'Some Error' } }
    }
    const request = {
      response,
      getTraceId: jest.fn(),
      logger: { error: jest.fn() },
      path: '/widgets'
    }
    const fromBoomSpy = jest.spyOn(ProblemDetails, 'fromBoom')

    formatErrorToRFC9457Response.plugin.register(customServer, {
      shouldFormat: () => true,
      typeBase: 'https://example.com/problems/'
    })
    const customHandler = customServer.ext.mock.calls[0][1]

    const result = customHandler(request, h)

    expect(fromBoomSpy).toHaveBeenCalledWith(response, {
      instance: request.path,
      typeBase: 'https://example.com/problems/'
    })
    expect(result).toBe(mockedResponse)
  })
})
