import { execFileSync } from 'node:child_process'
import * as httpErrors from '@defra/waste-movement-utils-http-errors'
import * as referenceData from '@defra/waste-movement-utils-reference-data'
import * as service from '@defra/waste-movement-utils-service'
import * as umbrella from './index.js'

// Every name a service could import before the library was split into packages
const NAMES_BEFORE_THE_SPLIT = [
  'ADDRESS_ERRORS',
  'ALL_CARRIER_REGISTRATION_NUMBER_REGEXES',
  'ALL_SITE_AUTHORISATION_NUMBER_REGEXES',
  'AUDIT_LOGGER_TYPE',
  'AUTHORISATION_ERRORS',
  'BULK_RESPONSE_STATUS',
  'CARRIER_ERRORS',
  'CARRIER_WARNINGS',
  'CONSIGNMENT_ERRORS',
  'DATE_ERRORS',
  'DISPOSAL_CODES',
  'DISPOSAL_OR_RECOVERY_CODES',
  'ERROR_CATEGORIES',
  'ERROR_TYPE',
  'HAZARDOUS_ERRORS',
  'HTTP_STATUS',
  'IRL_POSTCODE_REGEX',
  'JOI_TYPE_TO_CATEGORY',
  'MEANS_OF_TRANSPORT',
  'METRIC_NAMES',
  'NO_CONSIGNMENT_REASONS',
  'POPS_ERRORS',
  'POPS_OR_HAZARDOUS_ERRORS',
  'POPS_OR_HAZARDOUS_WARNINGS',
  'PRODUCTION_APPROVAL_TEST_ERRORS',
  'PRODUCTION_APPROVAL_TEST_SCENARIO_IDS',
  'REASONS_FOR_NO_REGISTRATION_NUMBER',
  'RECEIPT_WARNINGS',
  'RECOVERY_CODES',
  'SCOTLAND_EAS_SIX_DIGIT_SITE_AUTHORISATION_NUMBER_REGEX',
  'TEST_CONSTANTS',
  'TEST_DATA',
  'UK_POSTCODE_REGEX',
  'VALIDATION_WARNING_TYPES',
  'WASTE_ERRORS',
  'WASTE_WARNINGS',
  'backoffOptions',
  'basicAuth',
  'carrierBrokerDealerRegistrationNumberErrorTests',
  'concentrationOperators',
  'createMovementRequest',
  'createTestMongoDb',
  'createTestPayload',
  'createTestPayloadWith',
  'formatErrorToRFC9457Response',
  'formatPopsOrHazardousFields',
  'generateAllValidationWarnings',
  'generateWasteTrackingId',
  'getEnvVars',
  'getErrorCategory',
  'hasHazardousEwcCodes',
  'hazardousPropertyCodes',
  'hazardousWasteConsignmentCodeSchema',
  'invalidCarrierRegistrationNumbers',
  'isValidContainerType',
  'isValidEwcCode',
  'isValidHazardousEwcCode',
  'isValidMetricName',
  'isValidPopCode',
  'logOpenSearchMetrics',
  'logSixDigitEasAuthorisationNumber',
  'movementSchema',
  'popsAndHazardousComponentWarningTests',
  'popsAndHazardousComponentsErrorTests',
  'popsAndHazardousConcentrationOperatorTests',
  'processValidationWarnings',
  'productionApprovalTestScenarioIds',
  'productionApprovalTestsRequestPayload',
  'productionApprovalTestsResults',
  'productionApprovalTestsSchema',
  'receiveMovementRequestSchema',
  'sourceOfComponentsNotProvided',
  'sourceOfComponentsProvided',
  'validCarrierRegistrationNumbers',
  'validContainerTypes',
  'validEnglandCarrierRegistrationNumbers',
  'validEwcCodes',
  'validHazCodes',
  'validNiCarrierRegistrationNumbers',
  'validNrwCarrierRegistrationNumbers',
  'validPopNames',
  'validSepaCarrierRegistrationNumbers',
  'validSourceOfComponents',
  'validationErrorFormatter',
  'wasteItemsSchema',
  'weightSchema'
]

describe('index', () => {
  // Node drops a name two packages export and Babel can keep it, so both are asked
  it('exports every name it exported before the split, and no other', () => {
    const namesInNode = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        "console.log(JSON.stringify(Object.keys(await import('./src/index.js'))))"
      ],
      { encoding: 'utf8' }
    )

    expect(JSON.parse(namesInNode)).toEqual(NAMES_BEFORE_THE_SPLIT)
    expect(Object.keys(umbrella).sort()).toEqual(NAMES_BEFORE_THE_SPLIT)
  })

  it.each([
    ['http-errors', httpErrors],
    ['reference-data', referenceData],
    ['service', service]
  ])('re-exports the %s package, name for name', (_name, pkg) => {
    Object.keys(pkg).forEach((name) => {
      expect(umbrella[name]).toBe(pkg[name])
    })
  })
})
