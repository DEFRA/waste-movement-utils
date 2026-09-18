import { ProblemDetails } from '../domain/problem-details.js'

const defaultTypeBase = 'https://waste-tracking.service.gov.uk/problems/'

const formatBoomResponse = (request, h, typeBase) => {
  const { response, logger, path, getTraceId } = request
  const requestId = getTraceId()
  const problem = ProblemDetails.fromBoom(response, {
    instance: path,
    typeBase,
    ...(requestId && { requestId })
  })

  logger.error(problem.toJSON(), problem.title)
  return problem.toHapiResponse(h)
}

/**
 * @typedef {object} FormatErrorResponseOptions
 * @property {(request: import('@hapi/hapi').Request) => boolean} [shouldFormat]
 *   Determines whether a Boom response for this request is formatted.
 * @property {string} [typeBase] Base URI used to construct problem type URIs.
 */

export const formatErrorToRFC9457Response = {
  plugin: {
    name: 'problem-details-error-formatter',
    /**
     * @param {import('@hapi/hapi').Server} server
     * @param {FormatErrorResponseOptions} [options]
     */
    register: (
      server,
      { shouldFormat = () => false, typeBase = defaultTypeBase } = {}
    ) =>
      server.ext('onPreResponse', (request, h) =>
        request.response.isBoom && shouldFormat(request)
          ? formatBoomResponse(request, h, typeBase)
          : h.continue
      )
  }
}
