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
})
