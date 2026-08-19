export const METRIC_NAMES = {
  RECEIPTS_RECEIVED: 'receipts.received',
  RECEIPTS_RECEIVED_BULK: 'receipts.received.bulk',
  VALIDATION_WARNINGS_COUNT: 'validation.warnings.count',
  VALIDATION_REQUESTS_WITH_WARNINGS: 'validation.requests.with_warnings',
  VALIDATION_REQUESTS_WITHOUT_WARNINGS: 'validation.requests.without_warnings',
  VALIDATION_WARNING_REASON: 'validation.warning.reason',
  VALIDATION_REQUESTS_WITHOUT_ERRORS: 'validation.requests.without_errors',
  VALIDATION_REQUESTS_WITH_ERRORS: 'validation.requests.with_errors',
  VALIDATION_ERRORS_COUNT: 'validation.errors.count',
  VALIDATION_ERROR_REASON: 'validation.error.reason',
  VALIDATION_ERROR_CATEGORY: 'validation.error.category',
  ERRORS_BY_STATUS_CODE: 'errors.by_status_code',
  DEVELOPERS_ACTIVE: 'developers.active',
  DEVELOPERS_ATTEMPTED: 'developers.attempted',
  AUDIT_ERRORS_FAILED: 'audit.errors.failed',
  RECEIVER_ORG_ID: 'receiver.orgId',
  RECEIVER_ORG_ID_BULK: 'receiver.orgId.bulk',
  PAT_CREATE: 'pat.create',
  PAT_SUBMISSION: 'pat.submission',
  PAT_SCENARIO_RESULT: 'pat.scenario.result'
}

/**
 * Determines if a metric name is valid
 *
 * @param {String} metricName - The metric name
 *
 * @returns {Boolean} True if the metric name is valid, otherwise false
 */
export function isValidMetricName(metricName) {
  return Object.values(METRIC_NAMES).includes(metricName)
}
