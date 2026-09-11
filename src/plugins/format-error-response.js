import { ProblemDetails } from '../domain/problem-details.js'

export const formatErrorToRFC9457Response = {
  plugin: {
    name: 'problem-details-error-formatter',
    register: async (server) => {
      server.ext('onPreResponse', async (request, h) => {
        const { response, logger } = request
        const isNewMovementsEndpoint = request.path.startsWith('/beta-')

        if (isNewMovementsEndpoint && response.isBoom) {
          const problem = ProblemDetails.fromBoom(response, {
            instance: request.path,
            typeBase: 'https://api.example.com/errors/'
          })
          logger.error(problem.toJSON(), problem.title)

          return problem.toHapiResponse(h)
        }

        return h.continue
      })
    }
  }
}
