/**
 * Generates an options object for exponential backoff.
 *
 * See https://www.npmjs.com/package/exponential-backoff for all options.
 *
 * @param {Object} logger - The logger to use
 * @param {Number} numOfAttempts - The number of backoff attempts to retry, defaults to 6
 *
 * @returns {Object} The options object
 */
export function backoffOptions(logger, numOfAttempts = 6) {
  return {
    numOfAttempts,
    retry: (error, attemptNumber) => {
      logger.error(
        `Backoff attempt ${attemptNumber} of ${numOfAttempts}: ${error.message}`
      )
      return true
    }
  }
}
