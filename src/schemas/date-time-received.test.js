import { receiveMovementRequestSchema } from './receipt.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import { v4 as uuidv4 } from 'uuid'

describe('Create Receipt Movement - Date and Time Received Validation', () => {
  describe('Schema Validation Tests for dateTimeReceived', () => {
    it('should accept a valid GMT ISO date-time without milliseconds for dateTimeReceived', () => {
      const payload = {
        ...createMovementRequest(),
        dateTimeReceived: '2025-08-29T15:24:00Z'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeUndefined()
    })

    it('should accept a valid GMT ISO date-time with milliseconds for dateTimeReceived', () => {
      const payload = {
        ...createMovementRequest(),
        dateTimeReceived: '2025-08-29T15:24:00.000Z'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeUndefined()
    })

    it('should accept a valid BST ISO date-time without milliseconds for dateTimeReceived', () => {
      const payload = {
        ...createMovementRequest(),
        dateTimeReceived: '2025-08-29T15:24:00+01:00'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeUndefined()
    })

    it('should accept a valid BST ISO date-time with milliseconds for dateTimeReceived', () => {
      const payload = {
        ...createMovementRequest(),
        dateTimeReceived: '2025-08-29T15:24:00.000+01:00'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeUndefined()
    })

    it('should reject an invalid date-time for dateTimeReceived', () => {
      const payload = {
        ...createMovementRequest(),
        // Invalid ISO date-time
        dateTimeReceived: 'not-a-date'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      // Joi message for iso constraint typically contains 'must be in iso format'
      expect(error.details[0].message).toBe(
        '"dateTimeReceived" must be a valid UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00) ISO datetime'
      )
    })

    it('should reject when receipt is provided without dateTimeReceived', () => {
      const payload = {
        apiCode: uuidv4()
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe('"dateTimeReceived" is required')
    })

    it('should reject when dateTimeReceived does not include the offset', () => {
      const payload = {
        ...createMovementRequest(),
        dateTimeReceived: '2025-08-29T15:24:00'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        '"dateTimeReceived" must be a valid UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00) ISO datetime'
      )
    })

    it('should reject when dateTimeReceived includes an invalid offset format', () => {
      const payload = {
        ...createMovementRequest(),
        dateTimeReceived: '2025-08-29T15:24:00+0100'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        '"dateTimeReceived" must be a valid UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00) ISO datetime'
      )
    })

    it('should reject when dateTimeReceived includes an invalid offset value', () => {
      const payload = {
        ...createMovementRequest(),
        dateTimeReceived: '2025-08-29T15:24:00+02:00'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        '"dateTimeReceived" must be a valid UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00) ISO datetime'
      )
    })

    it('should reject when dateTimeReceived does not include the time', () => {
      const payload = {
        ...createMovementRequest(),
        dateTimeReceived: '2025-08-29'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        '"dateTimeReceived" must be a valid UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00) ISO datetime'
      )
    })

    it('should reject when dateTimeReceived includes an invalid date', () => {
      const payload = {
        ...createMovementRequest(),
        dateTimeReceived: '2025-15-29T15:24:00Z'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        '"dateTimeReceived" must be a valid UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00) ISO datetime'
      )
    })

    it('should reject when dateTimeReceived includes an invalid time', () => {
      const payload = {
        ...createMovementRequest(),
        dateTimeReceived: '2025-08-29T32:24:00Z'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        '"dateTimeReceived" must be a valid UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00) ISO datetime'
      )
    })
  })

  describe('Conversion of dateTimeReceived to UTC', () => {
    const convert = (dateTimeReceived) => {
      const { error, value } = receiveMovementRequestSchema.validate({
        ...createMovementRequest(),
        dateTimeReceived
      })
      expect(error).toBeUndefined()
      return value.dateTimeReceived.toISOString()
    }

    it.each([
      ['2025-09-15T12:12:28Z', '2025-09-15T12:12:28.000Z'],
      ['2025-09-15T12:12:28.000Z', '2025-09-15T12:12:28.000Z'],
      ['2025-09-15T13:12:28+01:00', '2025-09-15T12:12:28.000Z'],
      ['2025-09-15T13:12:28.000+01:00', '2025-09-15T12:12:28.000Z'],
      ['2025-09-15T00:30:00+01:00', '2025-09-14T23:30:00.000Z'],
      ['2025-09-15T12:12:28+00:00', '2025-09-15T12:12:28.000Z'],
      ['2025-09-15T12:12:28.000+00:00', '2025-09-15T12:12:28.000Z'],
      ['2000-01-01T00:30:00+01:00', '1999-12-31T23:30:00.000Z']
    ])('should store %s as %s', (dateTimeReceived, expected) => {
      expect(convert(dateTimeReceived)).toBe(expected)
    })

    it('should not depend on the timezone of the server', () => {
      const originalTimezone = process.env.TZ
      try {
        for (const timezone of ['UTC', 'Europe/London', 'America/New_York']) {
          process.env.TZ = timezone
          expect(convert('2025-09-15T12:12:28Z')).toBe(
            '2025-09-15T12:12:28.000Z'
          )
          expect(convert('2025-09-15T13:12:28+01:00')).toBe(
            '2025-09-15T12:12:28.000Z'
          )
        }
      } finally {
        if (originalTimezone === undefined) {
          delete process.env.TZ
        } else {
          process.env.TZ = originalTimezone
        }
      }
    })

    it('should be described as an ISO date-time with an example, for the API docs', () => {
      // hapi-swagger turns Joi.date().iso() into `format: date-time`
      const description = receiveMovementRequestSchema
        .extract('dateTimeReceived')
        .describe()

      expect(description.type).toBe('date')
      expect(description.flags.format).toBe('iso')
      expect(description.flags.description).toContain('UTC')
      expect(description.examples).toEqual(['2025-09-15T13:12:28+01:00'])
    })

    it('should still accept a Date object, as before', () => {
      const { error, value } = receiveMovementRequestSchema.validate({
        ...createMovementRequest(),
        dateTimeReceived: new Date('2025-09-15T12:12:28Z')
      })
      expect(error).toBeUndefined()
      expect(value.dateTimeReceived.toISOString()).toBe(
        '2025-09-15T12:12:28.000Z'
      )
    })

    it('should reject a numeric timestamp', () => {
      const { error } = receiveMovementRequestSchema.validate({
        ...createMovementRequest(),
        dateTimeReceived: Date.parse('2025-09-15T12:12:28Z')
      })
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        '"dateTimeReceived" must be a valid UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00) ISO datetime'
      )
    })

    it.each([
      ['an offset other than UTC or BST', '2025-09-15T14:12:28+02:00'],
      ['29 February in a non-leap year', '0001-02-29T00:00:00Z']
    ])('should reject %s', (_, dateTimeReceived) => {
      const { error } = receiveMovementRequestSchema.validate({
        ...createMovementRequest(),
        dateTimeReceived
      })
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        '"dateTimeReceived" must be a valid UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00) ISO datetime'
      )
    })

    it('should accept 29 February in a leap year with a two-digit year', () => {
      // Date.UTC would treat year 0 as 1900, which isn't a leap year
      expect(convert('0000-02-29T00:00:00Z')).toBe('0000-02-29T00:00:00.000Z')
    })

    it('should report the value the client sent in the error context', () => {
      const { error } = receiveMovementRequestSchema.validate({
        ...createMovementRequest(),
        dateTimeReceived: '2025-09-15T14:12:28+02:00'
      })
      expect(error.details[0].context.value).toBe('2025-09-15T14:12:28+02:00')
    })

    it('should reject an impossible date rather than rolling it over', () => {
      const { error } = receiveMovementRequestSchema.validate({
        ...createMovementRequest(),
        dateTimeReceived: '2025-02-30T12:00:00Z'
      })
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        '"dateTimeReceived" must be a valid UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00) ISO datetime'
      )
    })
  })
})
