import { ProblemDetails } from '../domain/problem-details.js'

const isNewMovementsEndpoint = (request) => {
  return request.path.startsWith('/beta-')
}

export const formatErrorToRFC9457Response = {
  plugin: {
    name: 'problem-details-error-formatter',
    register: async (server) => {
      server.ext('onPreResponse', async (request, h) => {
        const { response, logger } = request

        if (isNewMovementsEndpoint(request) && response.isBoom) {
          const problem = ProblemDetails.fromBoom(response, {
            instance: request.path,
            typeBase: 'https://waste-tracking.service.gov.uk/problems/'
          })
          logger.error(problem.toJSON(), problem.title)

          return problem.toHapiResponse(h)
        }

        return h.continue
      })
    }
  }
}
