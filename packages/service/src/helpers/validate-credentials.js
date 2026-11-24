/**
 * Validates the user supplied credentials with the valid credentials
 *
 * @param {String} validCredentials - The valid credentials
 * @param {Object} logger - The logger
 *
 * @returns {Function} Function to validate the user supplied credentials
 */
export function validateCredentials(validCredentials, logger) {
  if (logger) {
    logger.debug('Basic Auth Plugin: Validating Credentials Started')
  }

  validCredentials = validCredentials || []

  return async (_request, username, password) => {
    if (logger) {
      logger.debug('Basic Auth Plugin: Checking Credentials')
    }

    const base64EncodedCredentials = btoa(`${username}=${password}`)
    const matchingCredential = validCredentials.find((cred) => {
      if (logger) {
        logger.debug(
          `Basic Auth Plugin: Found Credential To Check (isValid: ${cred === base64EncodedCredentials})`
        )
      }

      return cred === base64EncodedCredentials
    })

    if (logger) {
      logger.debug(
        `Basic Auth Plugin: Validating Credentials Finished (data: ${JSON.stringify({ isValid: !!matchingCredential, credentials: { username } })})`
      )
    }

    return { isValid: !!matchingCredential, credentials: { username } }
  }
}
