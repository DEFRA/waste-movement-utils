import Joi from 'joi'
import { receiveMovementRequestSchema } from '../../schemas/receipt.js'

// Fixture routes shared by `scripts/capture-openapi-golden.js` (which feeds
// them to the real hapi-swagger 17.3.2) and `src/openapi/index.test.js`
// (which feeds them to `generateOpenApi`). Both must produce the same spec.

const handler = () => null

const errorResponse = (statusCode, label) =>
  Joi.object({
    statusCode: Joi.number().valid(statusCode),
    error: Joi.string(),
    message: Joi.string()
  }).label(label)

const address = Joi.object({
  line1: Joi.string().max(100).required().description('First line'),
  line2: Joi.string().allow('', null),
  postcode: Joi.string()
    .pattern(/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i)
    .required()
}).label('Address')

const part = Joi.object({
  name: Joi.string().required(),
  quantity: Joi.number().integer().min(1).max(500).default(1),
  weight: Joi.object({
    metric: Joi.string().valid('Grams', 'Kilograms', 'Tonnes').required(),
    amount: Joi.number().positive().precision(2).required(),
    isEstimate: Joi.boolean().required()
  }).label('Weight')
}).label('Part')

const widget = Joi.object({
  name: Joi.string().min(2).max(50).required().example('Sprocket'),
  kind: Joi.string()
    .valid('small', 'medium', 'large')
    .required()
    .description('Widget size'),
  email: Joi.string().email(),
  createdAt: Joi.date().iso(),
  tags: Joi.array().items(Joi.string()).unique().max(5),
  parts: Joi.array().items(part).min(1),
  address,
  reference: Joi.alternatives().try(Joi.string(), Joi.number()),
  notes: Joi.string().allow(null).optional()
}).label('Widget')

export const fixtureRoutes = [
  {
    method: 'GET',
    path: '/api/widgets/{widgetId}',
    options: {
      tags: ['api'],
      description: 'Get a widget',
      notes: ['Returns one widget', 'Or a 404'],
      validate: {
        params: Joi.object({
          widgetId: Joi.string().guid().required()
        }),
        query: Joi.object({
          expand: Joi.boolean().default(false),
          fields: Joi.array().items(Joi.string().valid('name', 'kind')),
          limit: Joi.number().integer().min(1).max(100)
        }),
        headers: Joi.object({
          'x-request-id': Joi.string().required()
        }).unknown()
      },
      response: { schema: widget },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: { description: 'The widget', schema: widget },
            404: {
              description: 'Not found',
              schema: errorResponse(404, 'NotFoundResponse')
            }
          }
        }
      }
    },
    handler
  },
  {
    method: 'POST',
    path: '/api/widgets',
    options: {
      tags: ['api'],
      description: 'Create a widget',
      validate: { payload: widget },
      plugins: {
        'hapi-swagger': {
          payloadType: 'json',
          responses: {
            201: {
              description: 'Created',
              schema: Joi.object({ widgetId: Joi.string() }).label('Created')
            },
            400: {
              description: 'Bad Request',
              schema: errorResponse(400, 'BadRequestResponse')
            }
          }
        }
      }
    },
    handler
  },
  {
    method: 'PUT',
    path: '/api/widgets/{widgetId}/parts/{partId}',
    options: {
      tags: ['api', 'parts'],
      description: 'Replace a part',
      validate: {
        params: Joi.object({
          widgetId: Joi.string().required(),
          partId: Joi.number().integer().required()
        }),
        payload: Joi.array().items(part).label('Parts')
      },
      plugins: {
        'hapi-swagger': {
          params: {},
          responses: {
            204: { description: 'Replaced' },
            400: {
              description: 'Bad Request',
              schema: errorResponse(400, 'BadRequestResponse')
            }
          }
        }
      }
    },
    handler
  },
  {
    method: 'DELETE',
    path: '/admin/widgets/{widgetId}',
    options: {
      tags: ['admin'],
      description: 'Only included by the function routeTag',
      validate: { params: Joi.object({ widgetId: Joi.string() }) }
    },
    handler
  },
  {
    method: 'GET',
    path: '/health',
    handler
  }
]

export const movementRoutes = [
  {
    method: 'POST',
    path: '/movements/{wasteTrackingId}/receive',
    options: {
      tags: ['movements'],
      description: 'Create a new waste input with a receipt movement',
      validate: {
        payload: Joi.object({
          movement: receiveMovementRequestSchema.required()
        }).label('Movement'),
        headers: Joi.object({
          'x-dwt-client-id': Joi.string()
        }).unknown(),
        params: Joi.object({
          wasteTrackingId: Joi.string().required()
        })
      },
      plugins: {
        'hapi-swagger': {
          params: {},
          responses: {
            204: { description: 'Successfully created waste input' },
            400: {
              description: 'Bad Request',
              schema: errorResponse(400, 'BadRequestResponse')
            }
          }
        }
      }
    },
    handler
  }
]

const baseOptions = {
  info: {
    title: 'Fixture API',
    version: '1.0',
    description: 'Golden snapshot fixture'
  },
  schemes: ['http', 'https'],
  host: 'fixture.example.test',
  grouping: 'tags',
  expanded: 'full',
  sortTags: 'alpha',
  sortEndpoints: 'alpha',
  pathPrefixSize: 2,
  basePath: '/',
  pathReplacements: []
}

// Each case: hapi-swagger options plus the routes it documents. The golden
// file is `<name>.json` alongside this module.
export const goldenCases = [
  {
    name: 'dereferenced',
    routes: fixtureRoutes,
    options: {
      ...baseOptions,
      tags: [{ name: 'api', description: 'Widget operations' }],
      deReference: true,
      routeTag: 'api'
    }
  },
  {
    name: 'definitions',
    routes: fixtureRoutes,
    options: {
      ...baseOptions,
      tags: [
        { name: 'admin', description: 'Admin operations' },
        { name: 'api', description: 'Widget operations' }
      ],
      deReference: false,
      routeTag: (tags) => tags.includes('api') || tags.includes('admin')
    }
  },
  {
    name: 'movement',
    routes: movementRoutes,
    options: {
      ...baseOptions,
      info: {
        title: 'Digital Waste Tracking Receipt API',
        version: '1.0',
        description: 'API for managing waste movements and receipts'
      },
      tags: [{ name: 'movements', description: 'Waste movement operations' }],
      deReference: true,
      routeTag: 'movements'
    }
  }
]
