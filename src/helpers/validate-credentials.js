/**
 * Validates the user supplied credentials with the valid credentials
 *
 * @param {String} validCredentials - The valid credentials
 *
 * @returns {Function} Function to validate the user supplied credentials
 */
export function validateCredentials(validCredentials) {
  validCredentials = validCredentials || []

  return async (_request, username, password) => {
    const base64EncodedCredentials = btoa(`${username}=${password}`)
    const matchingCredential = validCredentials.find(
      (cred) => cred === base64EncodedCredentials
    )

    return { isValid: !!matchingCredential, credentials: { username } }
  }
}
