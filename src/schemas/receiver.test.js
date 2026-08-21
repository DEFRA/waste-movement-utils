import { TEST_DATA } from './test-constants.js'
import { receiverSchema } from './receiver.js'

describe('Receiver Validation', () => {
  it('accepts complete receiver info with UK postcode, email and phone', () => {
    const receiver = {
      siteName: 'Test Receiver',
      emailAddress: 'receiver@example.com',
      phoneNumber: '01234567890',
      authorisationNumber:
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_XX9999XX,
      address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeUndefined()
  })

  it('accepts when no receiver tel/email are provided', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumber: TEST_DATA.AUTHORISATION_NUMBERS.VALID.WALES_XX9999XX,
      address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeUndefined()
  })

  it('rejects when authorisation number is undefined', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumber: undefined,
      address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeDefined()
    expect(error.message).toBe('"authorisationNumber" is required')
  })

  it('rejects when authorisation number is null', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumber: null,
      address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeDefined()
    expect(error.message).toBe('"authorisationNumber" must be a string')
  })

  it('rejects when authorisation number is an empty string', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumber: '',
      address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"authorisationNumber" is not allowed to be empty'
    )
  })

  it('rejects when any receiver properties provided but siteName missing', () => {
    const receiver = {
      address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeDefined()
    expect(error.message).toBe('"siteName" is required')
  })

  it('rejects incomplete receipt without address', () => {
    const receiver = {
      siteName: 'Test Receiver',
      emailAddress: 'receiver@example.com',
      phoneNumber: '01234567890',
      authorisationNumber: TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_PPC_A
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeDefined()
    expect(error.message).toBe('"address" is required')
  })

  it('rejects incomplete receiver address without postcode', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumber: TEST_DATA.AUTHORISATION_NUMBERS.VALID.WALES_EPR,
      address: { fullAddress: '1 Receiver St, Town' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeDefined()
    expect(error.message).toBe('"address.postcode" is required')
  })

  it('accepts incomplete receiver address without fullAddress', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumber: TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_WPPC,
      address: { postcode: 'SE1 1SE' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).not.toBeDefined()
  })

  it('rejects invalid UK postcode', () => {
    const receiver = {
      siteName: 'Invalid Postcode Receiver',
      authorisationNumber:
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_EAWML_6_DIGITS,
      address: { fullAddress: 'Full address', postcode: 'SE1 1SEEEEE' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"address.postcode" must be in valid UK or Ireland format'
    )
  })

  it('rejects valid Ireland Eircode', () => {
    const receiver = {
      siteName: 'Invalid Eircode Receiver',
      authorisationNumber:
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_WML_6_DIGITS,
      address: { fullAddress: 'Full address', postcode: 'INVALID EIR POSTCODE' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"address.postcode" must be in valid UK or Ireland format'
    )
  })

  it('rejects invalid receiver email address', () => {
    const receiver = {
      siteName: 'Invalid Email Receiver',
      emailAddress: 'not-an-email',
      authorisationNumber: TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_WML_L,
      address: { fullAddress: 'Full address', postcode: 'SE1 1SE' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeDefined()
    expect(error.message).toBe('"emailAddress" must be a valid email')
  })

  it('rejects when an authorisation number is provided with an invalid format', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumber: 1,
      address: { fullAddress: 'Full address', postcode: 'SE1 1SE' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeDefined()
    expect(error.message).toBe('"authorisationNumber" must be a string')
  })

  it('accepts receiver with only authorisation number', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumber:
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_XX9999XX,
      address: { fullAddress: 'Full address', postcode: 'SE1 1SE' }
    }

    const { error } = receiverSchema.validate(receiver)
    expect(error).toBeUndefined()
  })

  // Tests for DWT-578: Site Authorization Number Validation
  describe('Site Authorization Number Validation (DWT-578)', () => {
    // Test invalid formats from acceptance criteria
    describe.each([
      ['EAWML-10001', TEST_DATA.AUTHORISATION_NUMBERS.INVALID.EAWML_WITH_DASH],
      ['GMB383838X', TEST_DATA.AUTHORISATION_NUMBERS.INVALID.GMB_FORMAT],
      ['WEF1234567', TEST_DATA.AUTHORISATION_NUMBERS.INVALID.WEF_FORMAT]
    ])('rejects %s format', (formatExample, testDataValue) => {
      test(`invalidates ${formatExample}`, () => {
        const receiver = {
          siteName: 'Test Receiver',
          authorisationNumber: testDataValue,
          address: { fullAddress: 'Full address', postcode: 'SE1 1SE' }
        }

        const { error } = receiverSchema.validate(receiver)
        expect(error).toBeDefined()
        expect(error.message).toBe(
          '"authorisationNumber" must be in a valid UK format'
        )
      })
    })

    // Test all valid formats comprehensively (England, Scotland, Wales, Northern Ireland)
    test.each(Object.values(TEST_DATA.AUTHORISATION_NUMBERS.VALID))(
      'accepts valid format: %s',
      (format) => {
        const receiver = {
          siteName: 'Test Receiver',
          authorisationNumber: format,
          address: { fullAddress: 'Full address', postcode: 'SE1 1SE' }
        }

        const { error } = receiverSchema.validate(receiver)
        expect(error).toBeUndefined()
      }
    )

    // Test NI standalone formats are rejected (must be combined with WML reference)
    describe.each([
      ['WML 07/61', TEST_DATA.AUTHORISATION_NUMBERS.INVALID.NI_WML_ALONE],
      [
        'WML 19/36/T',
        TEST_DATA.AUTHORISATION_NUMBERS.INVALID.NI_WML_TRANSFER_ALONE
      ],
      ['LN/13/02', TEST_DATA.AUTHORISATION_NUMBERS.INVALID.NI_LN_ALONE],
      [
        'LN/13/02/M/V2',
        TEST_DATA.AUTHORISATION_NUMBERS.INVALID.NI_LN_WITH_SUFFIXES_ALONE
      ],
      ['PAC/2014/WCL001', TEST_DATA.AUTHORISATION_NUMBERS.INVALID.NI_PAC_ALONE]
    ])('rejects NI standalone format: %s', (formatExample, testDataValue) => {
      test(`invalidates ${formatExample}`, () => {
        const receiver = {
          siteName: 'Test Receiver',
          authorisationNumber: testDataValue,
          address: { fullAddress: 'Full address', postcode: 'SE1 1SE' }
        }

        const { error } = receiverSchema.validate(receiver)
        expect(error).toBeDefined()
        expect(error.message).toBe(
          '"authorisationNumber" must be in a valid UK format'
        )
      })
    })
  })
})
