import Joi from 'joi'
import {
  UK_POSTCODE_REGEX,
  ALL_SITE_AUTHORISATION_NUMBER_REGEXES
} from '../constants/regexes.js'
import {
  ADDRESS_ERRORS,
  CONSIGNMENT_ERRORS,
  AUTHORISATION_ERRORS,
  DATE_ERRORS
} from '../constants/validation-error-messages.js'
import { NO_CONSIGNMENT_REASONS } from '../constants/no-consignment-reasons.js'
import {
  hasHazardousEwcCodes,
  hazardousWasteConsignmentCodeSchema
} from './hazardous-waste-consignment.js'
import { wasteItemsSchema } from './waste.js'
import { addressSchema } from './address.js'
import { carrierSchema } from './carrier.js'
import { brokerOrDealerSchema } from './brokerOrDealer.js'

const MIN_STRING_LENGTH = 1
const LONG_STRING_MAX_LENGTH = 5000

// A date and time, with the offset for UTC (Z or +00:00) or BST (+01:00):
//   2025-08-29T15:24:00Z
//   2025-08-29T15:24:00.000Z
//   2025-08-29T15:24:00+00:00
//   2025-08-29T15:24:00+01:00
//   2025-08-29T15:24:00.000+01:00
const DATE_TIME_RECEIVED_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|\+0[01]:00)$/

/**
 * Narrows Joi.date().iso() to the dateTimeReceived contract. iso() parses
 * offsets correctly and documents the field as `format: date-time`, but on
 * its own it also accepts a date with no time, a time with no offset (read in
 * the server's timezone), any offset, and impossible dates such as 30 February
 * (rolled over to March). This checks the original string so those are
 * rejected.
 * @param {Date} value - The Date parsed by Joi.date().iso()
 * @param {Object} helpers - Joi custom validation helpers
 * @returns {Date|Object} The Date, or a Joi error
 */
const checkDateTimeReceived = (value, helpers) => {
  const invalid = () =>
    helpers.error('any.invalid', { value: helpers.original })

  // Only strings need narrowing; Date objects (e.g. from internal callers)
  // are accepted as before. iso() already rejects numeric timestamps
  if (typeof helpers.original !== 'string') {
    return value
  }

  const match = helpers.original.match(DATE_TIME_RECEIVED_REGEX)

  if (!match) {
    return invalid()
  }

  // Reject impossible dates (e.g. 30 February) rather than rolling them over.
  // setUTCFullYear, unlike Date.UTC, doesn't map years 0-99 to the 1900s
  const [_, year, month, day] = match.map(Number)
  const calendar = new Date(0)
  calendar.setUTCFullYear(year, month - 1, day)

  if (calendar.getUTCDate() !== day) {
    return invalid()
  }

  return value
}

/**
 * Determines if a site authorisation number is valid
 * @param {String} authorisationNumber - The site authorisation number
 * @returns {Boolean} True if the site authorisation number is valid, otherwise false
 */
const isValidAuthorisationNumber = (authorisationNumber) => {
  const trimmedAuthorisationNumber = authorisationNumber.trim()
  return ALL_SITE_AUTHORISATION_NUMBER_REGEXES.some((regex) =>
    regex.test(trimmedAuthorisationNumber)
  )
}

const authorisationNumberSchema = Joi.string()
  .strict()
  .custom((value, helpers) => {
    if (isValidAuthorisationNumber(value)) {
      return value
    }
    return helpers.error('InvalidFormat.authorisationNumber')
  })
  .messages({
    'InvalidFormat.authorisationNumber': AUTHORISATION_ERRORS.INVALID
  })
  .required()

const receiverAddressSchema = addressSchema.keys({
  fullAddress: Joi.string().required(),
  postcode: Joi.string()
    .pattern(UK_POSTCODE_REGEX)
    .message(ADDRESS_ERRORS.POSTCODE_UK_FORMAT)
    .required()
})

const receiverSchema = Joi.object({
  siteName: Joi.string().required(),
  emailAddress: Joi.string().email(),
  phoneNumber: Joi.string(),
  authorisationNumber: authorisationNumberSchema,
  regulatoryPositionStatements: Joi.array().items(
    Joi.number().strict().integer().positive()
  )
})

const receiptSchema = Joi.object({
  address: receiverAddressSchema.required()
})

export const receiveMovementRequestSchema = Joi.object({
  apiCode: Joi.string().uuid(),
  softwareProvider: Joi.object({
    name: Joi.string(),
    id: Joi.string()
  }),
  submittingOrganisation: Joi.object({
    defraCustomerOrganisationId: Joi.string().required(),
    defraCustomerOrganisationName: Joi.string(),
    defraCustomerOrganisationIsLocalAuthority: Joi.boolean().strict()
  }),
  dateTimeReceived: Joi.date()
    .iso()
    .custom(checkDateTimeReceived)
    .required()
    .description(
      'Date and time the waste was received, in UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00)'
    )
    .example('2025-09-15T13:12:28+01:00')
    .messages({
      'date.base': DATE_ERRORS.INVALID,
      'date.format': DATE_ERRORS.INVALID,
      'any.invalid': DATE_ERRORS.INVALID
    }),
  hazardousWasteConsignmentCode: hazardousWasteConsignmentCodeSchema,
  reasonForNoConsignmentCode: Joi.string().allow(null, ''),
  yourUniqueReference: Joi.string(),
  otherReferencesForMovement: Joi.array().items(
    Joi.object({
      label: Joi.string().min(MIN_STRING_LENGTH).required(),
      reference: Joi.string().min(MIN_STRING_LENGTH).required()
    })
  ),
  specialHandlingRequirements: Joi.string().max(LONG_STRING_MAX_LENGTH),
  wasteItems: Joi.array().items(wasteItemsSchema).required().min(1),
  carrier: carrierSchema.required(),
  brokerOrDealer: brokerOrDealerSchema,
  receiver: receiverSchema.required(),
  receipt: receiptSchema.required()
})
  .xor('apiCode', 'submittingOrganisation')
  .custom((value, helpers) => {
    const hasHazardous = hasHazardousEwcCodes(value)

    // Only validate if there are hazardous codes and no consignment code provided
    if (hasHazardous && !value.hazardousWasteConsignmentCode) {
      if (!value.reasonForNoConsignmentCode) {
        return helpers.error('BusinessRuleViolation.reasonRequired', {
          local: { fieldName: 'reasonForNoConsignmentCode' }
        })
      }

      if (!NO_CONSIGNMENT_REASONS.includes(value.reasonForNoConsignmentCode)) {
        return helpers.error('InvalidValue.reasonForNoConsignmentCode', {
          local: { fieldName: 'reasonForNoConsignmentCode' }
        })
      }
    }

    return value
  })
  .messages({
    'InvalidValue.reasonForNoConsignmentCode': `${CONSIGNMENT_ERRORS.REASON_INVALID_PREFIX} ${NO_CONSIGNMENT_REASONS.join(', ')}`,
    'BusinessRuleViolation.reasonRequired': CONSIGNMENT_ERRORS.REASON_REQUIRED
  })
  .label('ReceiveMovementRequest')
