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

    it.each([
      '2026',
      '2026-01',
      '2026-01-01',
      '2026-01-01T00:00:00',
      '2026-10-15T12:32:49.84+00:00'
    ])(
      'should incorrectly pass validation for dateTimeReceived value %s',
      (dateTimeReceived) => {
        const payload = {
          ...createMovementRequest(),
          dateTimeReceived
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeUndefined()
      }
    )

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
        '"dateTimeReceived" must be in ISO 8601 date format'
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
        dateTimeReceived: 1757938348000 // 2025-09-15T12:12:28Z
      })
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        '"dateTimeReceived" must be a valid date'
      )
    })

    it('should accept 29 February in a leap year', () => {
      expect(convert('2024-02-29T12:00:00Z')).toBe('2024-02-29T12:00:00.000Z')
    })
  })
})
