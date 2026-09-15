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
    await formatErrorToRFC9457Response.plugin.register(server)
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

  it('formats and logs a Boom error on the beta-1 endpoint', async () => {
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
      path: '/beta-1/widgets'
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
        instance: '/beta-1/widgets',
        status: '404',
        title: 'Some Error',
        type: 'https://waste-tracking.service.gov.uk/problems/some-error'
      },
      'Some Error'
    )
    expect(result).toBe(mockedResponse)
  })

  it('formats and logs a Boom error with a requestId on the beta-1 endpoint', async () => {
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
      path: '/beta-1/widgets'
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
        instance: '/beta-1/widgets',
        requestId: 'Trace-Id',
        status: '404',
        title: 'Some Error',
        type: 'https://waste-tracking.service.gov.uk/problems/some-error'
      },
      'Some Error'
    )
    expect(result).toBe(mockedResponse)
  })

  it('passes through when isBoom is true but the path is not beta-1', async () => {
    const logger = { error: jest.fn() }
    const request = {
      response: { isBoom: true },
      logger,
      path: '/v1/other-endpoint'
    }

    const result = await extHandler(request, h)

    expect(ProblemDetails.fromBoom).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
    expect(result).toBe(h.continue)
  })

  it('passes through when the response is not a Boom error', async () => {
    const request = {
      response: { isBoom: false },
      logger: { error: jest.fn() },
      path: '/beta-1/widgets'
    }

    const result = await extHandler(request, h)

    expect(ProblemDetails.fromBoom).not.toHaveBeenCalled()
    expect(result).toBe(h.continue)
  })
})
