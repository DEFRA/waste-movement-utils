import builder from './vendor/builder.cjs'
import defaults from './vendor/defaults.cjs'
import { applyToDefaults } from '@hapi/hoek'

/**
 * Builds the Swagger 2.0 (or OpenAPI 3.0) document that hapi-swagger 17.3.2
 * would serve at its `jsonPath`, from Joi-validated Hapi routes, without
 * registering anything on a server. See `./vendor/README.md`.
 *
 * Not re-exported from `src/index.js`, so services only load it from a
 * build-time script: `@defra/waste-movement-utils/src/openapi/index.js`.
 *
 * @param {Array} routes - `server.table()` of a server with the routes registered
 * @param {Object} options - hapi-swagger plugin options. With no request to
 *   derive them from, `host` and `schemes` (or `servers` for `OAS: 'v3.0'`)
 *   are required. UI-only options (`swaggerUI`, `documentationPath`, ...) are
 *   accepted and ignored.
 * @returns {Promise<Object>}
 */
export const generateOpenApi = async (routes, options = {}) => {
  const settings = applyToDefaults(defaults, options, {
    nullOverride: true
  })
  settings.log = options.log ?? (() => {})

  if (settings.OAS === 'v2' && (!settings.host || !settings.schemes)) {
    throw new Error('generateOpenApi: `host` and `schemes` are required')
  }
  if (settings.OAS !== 'v2' && !settings.servers) {
    throw new Error('generateOpenApi: `servers` is required')
  }

  return builder.getSwaggerJSON(settings, [...routes])
}
