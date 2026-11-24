import { logOpenSearchMetrics } from './log-opensearch-metrics.js'
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
      logOpenSearchMetrics(value, dimensions, logger)

      expect(logger.info).not.toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalled()
    }
  )

  it.each([null, undefined])(
    'should not log metrics to OpenSearch if dimensions is %s',
    (value) => {
      logOpenSearchMetrics(metricName, value, logger)

      expect(logger.info).not.toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalled()
    }
  )

  it.each([null, undefined, 'not-a-logger'])(
    'should not log metrics to OpenSearch if logger is %s',
    (value) => {
      // Assert that an error is thrown because in the unlikely event a logger is not
      // given then in this scenario an error can't be logged
      expect(() =>
        logOpenSearchMetrics(metricName, dimensions, value)
      ).toThrow()
      expect(logger.info).not.toHaveBeenCalled()
    }
  )

  it('should not log metrics to OpenSearch if no params are given', () => {
    // Assert that an error is thrown because in the unlikely event a logger is not
    // given then in this scenario an error can't be logged
    expect(() => logOpenSearchMetrics()).toThrow()
    expect(logger.info).not.toHaveBeenCalled()
  })
})
