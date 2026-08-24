import Joi from 'joi'
import {
  UK_POSTCODE_REGEX,
  ALL_SITE_AUTHORISATION_NUMBER_REGEXES
} from '../constants/regexes.js'
import {
  ADDRESS_ERRORS,
  CONSIGNMENT_ERRORS,
  AUTHORISATION_ERRORS
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
  submittingOrganisation: Joi.object({
    defraCustomerOrganisationId: Joi.string().required()
  }),
  dateTimeReceived: Joi.date().iso().required(),
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
  carrier: carrierSchema,
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
