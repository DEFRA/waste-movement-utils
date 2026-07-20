import Basic from '@hapi/basic'
import { validateCredentials } from '../helpers/validate-credentials.js'

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
      console.log('Basic Auth Plugin: Loaded Plugin')

      await server.register(Basic)

      console.log('Basic Auth Plugin: Registered Plugin')

      server.auth.strategy('basic', 'basic', {
        validate: validateCredentials(validCredentials)
      })

      console.log('Basic Auth Plugin: Credential Validation Complete')
    }
  }
})
