import { formatErrorToRFC9457Response } from './format-error-response.js'
import { ProblemDetails } from '../domain/problem-details.js'

jest.mock('../domain/problem-details.js')

describe('problem-details-error-formatter plugin', () => {
  let server
  let extHandler
  let h
  let toHapiResponseResult

  beforeEach(async () => {
    jest.clearAllMocks()

    server = { ext: jest.fn() }
    await formatErrorToRFC9457Response.plugin.register(server)
    extHandler = server.ext.mock.calls[0][1]

    toHapiResponseResult = { code: 'mocked-response' }
    ProblemDetails.fromBoom.mockReturnValue({
      title: 'Some Error',
      toJSON: jest.fn().mockReturnValue({ title: 'Some Error', status: 400 }),
      toHapiResponse: jest.fn().mockReturnValue(toHapiResponseResult)
    })

    h = { continue: Symbol('continue') }
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
    const response = { isBoom: true }
    const request = {
      response,
      logger,
      path: '/beta-1/widgets'
    }

    const result = await extHandler(request, h)

    expect(ProblemDetails.fromBoom).toHaveBeenCalledWith(response, {
      instance: request.path,
      typeBase: 'https://waste-tracking.service.gov.uk/problems/'
    })
    expect(logger.error).toHaveBeenCalledWith(
      { title: 'Some Error', status: 400 },
      'Some Error'
    )
    expect(result).toBe(toHapiResponseResult)
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
