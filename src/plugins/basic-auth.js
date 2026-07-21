import Basic from '@hapi/basic'
import { validateCredentials } from '../helpers/validate-credentials.js'

/**
 * Sets up a plugin to validate the user supplied credentials with the valid credentials
 *
 * @param {String} validCredentials - The valid credentials
 * @param {Object} logger - The logger
 *
 * @returns {Object} The auth plugin
 */
export const basicAuth = (validCredentials, logger) => ({
  plugin: {
    name: 'basic-auth',
    async register(server) {
      if (logger) {
        logger.debug('Basic Auth Plugin: Loading')
      }

      await server.register(Basic)

      if (logger) {
        logger.debug('Basic Auth Plugin: Registered')
      }

      server.auth.strategy('basic', 'basic', {
        validate: validateCredentials(validCredentials, logger)
      })

      if (logger) {
        logger.debug('Basic Auth Plugin: Loaded')
      }
    }
  }
})
