// Test Constants
import { validContainerTypes } from '../../constants/container-types.js'
import { createMovementRequest as defaultCreateMovementRequest } from '../../test/utils/createMovementRequest.js'

export const TEST_CONSTANTS = {
  VALID_EWC_CODE: '010101',
  DEFAULT_WASTE_DESCRIPTION: 'Test waste',
  DEFAULT_PHYSICAL_FORM: 'Solid',
  DEFAULT_METRIC: 'Tonnes',
  DEFAULT_AMOUNT: 1,
  DEFAULT_IS_ESTIMATE: false
}

// Factory variant: caller passes their own `createMovementRequest` so services
// with service-specific payload defaults (e.g. backend's apiCode1) can reuse
// the same waste-item defaults.
export const createTestPayloadWith = (createMovementRequest, overrides = {}) => {
  const { wasteItemOverrides, ...rootOverrides } = overrides

  // Build waste item with defaults
  const defaultWasteItem = {
    ewcCodes: [TEST_CONSTANTS.VALID_EWC_CODE],
    wasteDescription: TEST_CONSTANTS.DEFAULT_WASTE_DESCRIPTION,
    physicalForm: TEST_CONSTANTS.DEFAULT_PHYSICAL_FORM,
    weight: {
      metric: TEST_CONSTANTS.DEFAULT_METRIC,
      amount: TEST_CONSTANTS.DEFAULT_AMOUNT,
      isEstimate: TEST_CONSTANTS.DEFAULT_IS_ESTIMATE
    },
    numberOfContainers: 1,
    typeOfContainers: validContainerTypes[0].code,
    containsPops: false,
    containsHazardous: false
  }

  // Merge waste item overrides
  const wasteItem = wasteItemOverrides
    ? { ...defaultWasteItem, ...wasteItemOverrides }
    : defaultWasteItem

  // Build and return complete payload
  return {
    ...createMovementRequest(),
    wasteItems: [wasteItem],
    ...rootOverrides
  }
}

// Convenience bound to utils' baseline createMovementRequest — used by the
// schema tests that live in utils.
export const createTestPayload = (overrides) =>
  createTestPayloadWith(defaultCreateMovementRequest, overrides)
