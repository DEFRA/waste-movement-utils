import Hapi from '@hapi/hapi'
import Joi from 'joi'
import { notFound } from '@hapi/boom'
import { formatErrorToRFC9457Response } from './format-error-response.js'

const typeBase = 'https://waste-tracking.service.gov.uk/problems/'

const testSchema = Joi.object({
  apiCode: Joi.string()
    .uuid()
    .description('Unique identifier of the submitting organisation.')
    .example('25b14080-5e77-4f91-9957-2482a0cb8775')
    .required(),
  user: Joi.object({
    name: Joi.string().required(),
    age: Joi.number().required()
  })
})

const registerRoutes = (server) => {
  server.route([
    {
      method: 'POST',
      path: '/movements/{movementId}/collect',
      options: {
        validate: {
          payload: testSchema
        }
      },
      handler: (request, h) => h.response({ received: true }).code(201)
    },
    {
      method: 'GET',
      path: '/widgets/{id}',
      handler: (request) => {
        return notFound(`Widget ${request.params.id} not found`)
      }
    },
    {
      method: 'GET',
      path: '/v1/widgets/{id}',
      handler: (request) => {
        return notFound(`Widget ${request.params.id} not found`)
      }
    },
    {
      method: 'GET',
      path: '/v2/widgets/{id}',
      handler: (request) => {
        return notFound(`Widget ${request.params.id} not found`)
      }
    },
    {
      method: 'GET',
      path: '/crash',
      handler: () => {
        throw new Error('leaking db connection string: password=hunter2')
      }
    }
  ])
}

const buildServer = async (pluginOptions) => {
  const server = Hapi.server({
    routes: {
      validate: {
        options: { abortEarly: false },
        failAction: (_request, _h, error) => {
          throw error
        }
      }
    }
  })

  server.decorate('request', 'logger', { error: () => {} })

  let currentTraceId
  server.ext('onRequest', (request, h) => {
    currentTraceId = request.headers['x-cdp-request-id']
    return h.continue
  })
  server.decorate('request', 'getTraceId', () => currentTraceId)

  if (pluginOptions) {
    await server.register({
      plugin: formatErrorToRFC9457Response.plugin,
      options: pluginOptions
    })
  } else {
    await server.register(formatErrorToRFC9457Response)
  }

  registerRoutes(server)

  return server
}

describe('format-error-response plugin over real HTTP responses', () => {
  describe('configured to format RFC 9457 problem responses', () => {
    let server

    beforeAll(async () => {
      server = await buildServer({ shouldFormat: () => true, typeBase })
      await server.initialize()
    })

    afterAll(async () => {
      await server.stop()
    })

    it('formats a Joi schema validation failure as an RFC 9457 problem response', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/movements/movement-123/collect',
        payload: { user: {} }
      })

      expect(response.statusCode).toBe(400)
      expect(response.headers['content-type']).toBe('application/problem+json')

      const body = JSON.parse(response.payload)

      expect(body).toEqual({
        type: `${typeBase}bad-request`,
        title: 'Bad Request',
        detail: '3 validation errors occurred',
        instance: '/movements/movement-123/collect',
        errors: [
          {
            message: '"apiCode" is required',
            pointer: '/apiCode',
            errorType: 'any.required'
          },
          {
            message: '"user.name" is required',
            pointer: '/user/name',
            errorType: 'any.required'
          },
          {
            message: '"user.age" is required',
            pointer: '/user/age',
            errorType: 'any.required'
          }
        ]
      })
    })

    it('formats an explicit Boom error thrown from a handler', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/widgets/123'
      })

      expect(response.statusCode).toBe(404)
      expect(response.headers['content-type']).toBe('application/problem+json')

      const body = JSON.parse(response.payload)

      expect(body).toEqual({
        type: `${typeBase}not-found`,
        title: 'Not Found',
        detail: 'Widget 123 not found',
        instance: '/widgets/123'
      })
    })

    it('formats a plain thrown Error that Hapi boomifies into a 500, without leaking its message', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/crash'
      })

      expect(response.statusCode).toBe(500)
      expect(response.headers['content-type']).toBe('application/problem+json')
      expect(response.payload).not.toContain('password=hunter2')

      const body = JSON.parse(response.payload)

      expect(body).toEqual({
        type: `${typeBase}internal-server-error`,
        title: 'Internal Server Error',
        instance: '/crash'
      })
    })

    it('attaches the request trace id as requestId and an x-request-id header', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/widgets/123',
        headers: { 'x-cdp-request-id': 'trace-abc-123' }
      })

      expect(response.headers['x-request-id']).toBe('trace-abc-123')

      const body = JSON.parse(response.payload)
      expect(body).toEqual({
        type: `${typeBase}not-found`,
        title: 'Not Found',
        detail: 'Widget 123 not found',
        instance: '/widgets/123',
        requestId: 'trace-abc-123'
      })
    })
  })

  describe('registered with its default options', () => {
    let server

    beforeAll(async () => {
      server = await buildServer()
      await server.initialize()
    })

    afterAll(async () => {
      await server.stop()
    })

    it('passes Boom errors through unformatted, since shouldFormat defaults to always-false', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/does/not/exist'
      })

      expect(response.statusCode).toBe(404)
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      )

      const body = JSON.parse(response.payload)
      expect(body).toEqual({
        statusCode: 404,
        error: 'Not Found',
        message: 'Not Found'
      })
    })
  })

  describe('configured with a per-request shouldFormat predicate', () => {
    let server

    beforeAll(async () => {
      server = await buildServer({
        shouldFormat: (request) => request.path.startsWith('/v2'),
        typeBase
      })
      await server.initialize()
    })

    afterAll(async () => {
      await server.stop()
    })

    it('formats Boom errors on paths the predicate matches', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/v2/widgets/123'
      })

      expect(response.statusCode).toBe(404)
      expect(response.headers['content-type']).toBe('application/problem+json')

      const body = JSON.parse(response.payload)
      expect(body).toEqual({
        type: `${typeBase}not-found`,
        title: 'Not Found',
        detail: 'Widget 123 not found',
        instance: '/v2/widgets/123'
      })
    })

    it('leaves Boom errors unformatted on paths the predicate rejects', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/v1/widgets/123'
      })

      expect(response.statusCode).toBe(404)
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      )

      const body = JSON.parse(response.payload)
      expect(body).toEqual({
        statusCode: 404,
        error: 'Not Found',
        message: 'Widget 123 not found'
      })
    })
  })
})
