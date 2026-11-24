import { isValidMetricName } from '../constants/metric-names.js'

/**
 * Logs a metric to OpenSearch
 *
 * @param {String} metricName - The metric name
 * @param {Object} dimensions - The metric dimensions
 * @param {Object} logger - The logger
 */
export function logOpenSearchMetrics(metricName, dimensions, logger) {
  try {
    if (
      isValidMetricName(metricName) &&
      dimensions &&
      logger &&
      Object.prototype.hasOwnProperty.call(logger, 'info')
    ) {
      return logger.info(dimensions, `Metric: ${metricName}`)
    }

    throw new Error(
      `Expected metricName, dimensions and logger but received ${JSON.stringify({ metricName, dimensions, logger })}`
    )
  } catch (err) {
    logger.error(`Failed to log OpenSearch metrics: ${err.message}`)
  }
}
