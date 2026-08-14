import { isValidMetricName } from '../constants/metric-names.js'

export const openSearchMetricsErrorPrefix =
  'Failed to log OpenSearch metrics: Expected metricName, dimensions and logger but received'

/**
 * Logs a metric to OpenSearch
 *
 * @param {String} metricName - The metric name
 * @param {Object} dimensions - The metric dimensions
 * @param {Object} logger - The logger
 */
export function logOpenSearchMetrics(metricName, dimensions, logger) {
  if (
    isValidMetricName(metricName) &&
    dimensions &&
    logger &&
    Object.prototype.hasOwnProperty.call(logger, 'info')
  ) {
    return logger.info(dimensions, `Metric: ${metricName}`)
  }

  throw new Error(
    `${openSearchMetricsErrorPrefix} ${JSON.stringify({ metricName, dimensions, logger })}`
  )
}
