import {
  logOpenSearchMetrics,
  openSearchMetricsErrorPrefix
} from './log-opensearch-metrics.js'
import { METRIC_NAMES } from '../constants/metric-names.js'

describe('#logOpenSearchMetrics', () => {
  const metricName = METRIC_NAMES.RECEIPTS_RECEIVED
  const dimensions = {
    clientId: '2lteusehsq9vne7dp1h3vmte0'
  }
  const logger = {
    info: jest.fn(),
    error: jest.fn()
  }

  it('should log metrics to OpenSearch', () => {
    logOpenSearchMetrics(metricName, dimensions, logger)

    expect(logger.info).toHaveBeenCalledWith(
      dimensions,
      `Metric: ${metricName}`
    )
  })

  it.each([null, undefined, 'invalid.metric.name'])(
    'should not log metrics to OpenSearch if metricName is %s',
    (value) => {
      expect(() => logOpenSearchMetrics(value, dimensions, logger)).toThrow(
        openSearchMetricsErrorPrefix
      )
      expect(logger.info).not.toHaveBeenCalled()
    }
  )

  it.each([null, undefined])(
    'should not log metrics to OpenSearch if dimensions is %s',
    (value) => {
      expect(() => logOpenSearchMetrics(metricName, value, logger)).toThrow(
        openSearchMetricsErrorPrefix
      )
      expect(logger.info).not.toHaveBeenCalled()
    }
  )

  it.each([null, undefined, 'not-a-logger'])(
    'should not log metrics to OpenSearch if logger is %s',
    (value) => {
      expect(() => logOpenSearchMetrics(metricName, dimensions, value)).toThrow(
        openSearchMetricsErrorPrefix
      )
      expect(logger.info).not.toHaveBeenCalled()
    }
  )

  it('should not log metrics to OpenSearch if no params are given', () => {
    expect(() => logOpenSearchMetrics()).toThrow(openSearchMetricsErrorPrefix)
    expect(logger.info).not.toHaveBeenCalled()
  })
})
