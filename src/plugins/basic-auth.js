import Basic from '@hapi/basic'
import { validateCredentials } from '../helpers/validate-credentials'

/**
 * Sets up a plugin to validate the user supplied credentials with the valid credentials
 *
 * @param {String} validCredentials - The valid credentials
 *
 * @returns {Object} The auth plugin
 */
export const basicAuth = (validCredentials) => ({
  plugin: {
    name: 'basic-auth',
    async register(server) {
      await server.register(Basic)

      server.auth.strategy('basic', 'basic', {
        validate: validateCredentials(validCredentials)
      })
    }
  }
})
