import Basic from '@hapi/basic'

/**
 * Validates the user supplied credentials with the valid credentials
 *
 * @param {String} validCredentials - The valid credentials
 *
 * @returns {Function} Function to validate the user supplied credentials
 */
export function validate(validCredentials) {
  validCredentials = validCredentials || []

  return async (_request, username, password) => {
    const base64EncodedCredentials = btoa(`${username}=${password}`)
    const matchingCredential = validCredentials.find(
      (cred) => cred === base64EncodedCredentials
    )

    return { isValid: !!matchingCredential, credentials: { username } }
  }
}

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
        validate: validate(validCredentials)
      })
    }
  }
})
