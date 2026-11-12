import { METRIC_NAMES } from '../constants/metric-names.js'
import { SCOTLAND_EAS_SIX_DIGIT_SITE_AUTHORISATION_NUMBER_REGEX } from '../constants/regexes.js'

/**
 * Logs a receiver authorisation number of EAS/P with six digits, so OpenSearch
 * shows who still sends that format before DWTC-346 removes it
 *
 * @param {Object} payload - The request payload
 * @param {String} wasteTrackingId - The waste tracking id of the request
 * @param {Object} logger - The logger
 */
export function logSixDigitEasAuthorisationNumber(
  payload,
  wasteTrackingId,
  logger
) {
  const authorisationNumber = payload?.receiver?.authorisationNumber

  if (typeof authorisationNumber !== 'string') {
    return
  }

  const trimmedAuthorisationNumber = authorisationNumber.trim()

  if (
    SCOTLAND_EAS_SIX_DIGIT_SITE_AUTHORISATION_NUMBER_REGEX.test(
      trimmedAuthorisationNumber
    )
  ) {
    logger.info(
      `${METRIC_NAMES.RECEIVER_AUTHORISATION_NUMBER_SIX_DIGIT_EAS} - ${trimmedAuthorisationNumber} (wasteTrackingId: "${wasteTrackingId}")`
    )
  }
}
