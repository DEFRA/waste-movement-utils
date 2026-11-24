import { backoffOptions } from './exponential-backoff.js'

describe('backoffOptions tests', () => {
  describe('#retry', () => {
    it('should log an error message and return true', () => {
      const mockLogger = { error: jest.fn() }

      const result = backoffOptions(mockLogger).retry(
        new Error('Database Error'),
        1
      )

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Backoff attempt 1 of 6: Database Error'
      )
      expect(result).toBeTruthy()
    })
  })
})
