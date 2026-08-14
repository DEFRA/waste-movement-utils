import { isValidMetricName, METRIC_NAMES } from './metric-names.js'

describe('#isValidMetricName', () => {
  it('should return true when given a valid metric name', () => {
    const result = isValidMetricName(METRIC_NAMES.RECEIPTS_RECEIVED)

    expect(result).toEqual(true)
  })

  it.each([null, undefined, 'invalid.metric.name'])(
    'should return false when given %s',
    (value) => {
      const result = isValidMetricName(value)

      expect(result).toEqual(false)
    }
  )
})
