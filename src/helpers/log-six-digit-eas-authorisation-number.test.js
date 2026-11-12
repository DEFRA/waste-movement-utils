import { logSixDigitEasAuthorisationNumber } from './log-six-digit-eas-authorisation-number.js'

describe('#logSixDigitEasAuthorisationNumber', () => {
  const wasteTrackingId = '26S8EYDJ'
  const logger = {
    info: jest.fn()
  }

  it.each([
    ['EAS/P/123456', 'EAS/P/123456'],
    ['  eas/p/123456  ', 'eas/p/123456']
  ])(
    'should log a receiver authorisation number of "%s"',
    (authorisationNumber, loggedAuthorisationNumber) => {
      logSixDigitEasAuthorisationNumber(
        { receiver: { authorisationNumber } },
        wasteTrackingId,
        logger
      )

      expect(logger.info).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledWith(
        `receiver.authorisationNumber.six_digit_eas - ${loggedAuthorisationNumber} (wasteTrackingId: "26S8EYDJ")`
      )
    }
  )

  it.each([
    [
      'EAS/P with seven digits',
      { receiver: { authorisationNumber: 'EAS/P/1172829' } }
    ],
    [
      'another SEPA format',
      { receiver: { authorisationNumber: 'PPC/A/1234567' } }
    ],
    [
      'an authorisation number that is not a string',
      { receiver: { authorisationNumber: 123456 } }
    ],
    ['no receiver', {}],
    ['no payload', undefined]
  ])('should not log when given %s', (_label, payload) => {
    logSixDigitEasAuthorisationNumber(payload, wasteTrackingId, logger)

    expect(logger.info).not.toHaveBeenCalled()
  })
})
