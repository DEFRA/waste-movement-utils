import { concentrationOperators } from '../../../constants/concentration-operators.js'
import { createTestPayloadWith } from '../../../schemas/test-helpers/waste-test-helpers.js'
import { formatPopsOrHazardousFields } from '../../../schemas/waste.js'

const CONCENTRATION = 10
const UNSUPPORTED_OPERATOR = '>='

const { GREATER_THAN, LESS_THAN } = concentrationOperators

/**
 * Builds a payload containing a single POPs/Hazardous component, merging the
 * supplied concentration fields into it.
 */
const createPayload = ({
  createMovementRequest,
  popsOrHazardous,
  component
}) => {
  const { popsOrHazardousObjectProperty, containsPopsOrHazardousField } =
    formatPopsOrHazardousFields(popsOrHazardous)
  const isHazardous = popsOrHazardous === 'Hazardous'

  return createTestPayloadWith(createMovementRequest, {
    wasteItemOverrides: {
      [containsPopsOrHazardousField]: true,
      [popsOrHazardousObjectProperty]: {
        sourceOfComponents: 'OWN_TESTING',
        ...(isHazardous && { hazCodes: ['HP_1'] }),
        components: [
          {
            [isHazardous ? 'name' : 'code']: isHazardous ? 'Mercury' : 'ALD',
            ...component
          }
        ]
      }
    }
  })
}

export function popsAndHazardousConcentrationOperatorTests({
  receiveMovementRequestSchema,
  createMovementRequest,
  popsOrHazardous
}) {
  if (!['POPs', 'Hazardous'].includes(popsOrHazardous)) {
    throw new Error('Expecting popsOrHazardous to be one of: POPs, Hazardous')
  }

  const { popsOrHazardousObjectProperty } =
    formatPopsOrHazardousFields(popsOrHazardous)
  const isHazardous = popsOrHazardous === 'Hazardous'
  const componentPath = `wasteItems[0].${popsOrHazardousObjectProperty}.components[0]`

  const validate = (component) =>
    receiveMovementRequestSchema.validate(
      createPayload({ createMovementRequest, popsOrHazardous, component })
    )

  describe(`${popsOrHazardous} Concentration Operator Validation`, () => {
    it(`should accept a concentration qualified by "${GREATER_THAN}"`, () => {
      const result = validate({
        concentration: CONCENTRATION,
        concentrationOperator: GREATER_THAN
      })
      expect(result.error).toBeUndefined()
    })

    // Regulators record "below threshold" for POPs waste only. For hazardous
    // waste the only supported indication is that a threshold was exceeded.
    it(`should ${isHazardous ? 'reject' : 'accept'} a concentration qualified by "${LESS_THAN}"`, () => {
      const result = validate({
        concentration: CONCENTRATION,
        concentrationOperator: LESS_THAN
      })

      if (!isHazardous) {
        expect(result.error).toBeUndefined()
        return
      }

      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        `"${componentPath}.concentrationOperator" must be [${GREATER_THAN}]`
      )
    })

    it('should reject an operator supplied without a concentration', () => {
      const result = validate({ concentrationOperator: GREATER_THAN })
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        `"${componentPath}.concentration" is required`
      )
    })

    it('should reject an operator supplied with a null concentration', () => {
      const result = validate({
        concentration: null,
        concentrationOperator: GREATER_THAN
      })
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        `"${componentPath}.concentration" must be a number`
      )
    })

    it('should reject an unsupported operator', () => {
      const result = validate({
        concentration: CONCENTRATION,
        concentrationOperator: UNSUPPORTED_OPERATOR
      })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        `"${componentPath}.concentrationOperator" must be`
      )
    })

    it('should accept a concentration with no operator', () => {
      const result = validate({ concentration: CONCENTRATION })
      expect(result.error).toBeUndefined()
    })

    it('should accept a null concentration with no operator', () => {
      const result = validate({ concentration: null })
      expect(result.error).toBeUndefined()
    })
  })
}
