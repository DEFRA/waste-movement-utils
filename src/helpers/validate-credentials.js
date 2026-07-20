/**
 * Validates the user supplied credentials with the valid credentials
 *
 * @param {String} validCredentials - The valid credentials
 *
 * @returns {Function} Function to validate the user supplied credentials
 */
export function validateCredentials(validCredentials) {
  console.log('Basic Auth Plugin: Validating Credentials Started')

  validCredentials = validCredentials || []

  return async (_request, username, password) => {
    console.log('Basic Auth Plugin: Checking Credentials')

    const base64EncodedCredentials = btoa(`${username}=${password}`)
    const matchingCredential = validCredentials.find((cred) => {
      console.log(
        `Basic Auth Plugin: Found Credential To Check (isValid: ${cred === base64EncodedCredentials})`
      )

      return cred === base64EncodedCredentials
    })

    console.log(
      `Basic Auth Plugin: Validating Credentials Finished (data: ${JSON.stringify({ isValid: !!matchingCredential, credentials: { username } })})`
    )

    return { isValid: !!matchingCredential, credentials: { username } }
  }
}
