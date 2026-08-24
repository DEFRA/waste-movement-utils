import Joi from 'joi'
import { AUTHORISATION_ERRORS } from '../constants/validation-error-messages.js'
import { ALL_SITE_AUTHORISATION_NUMBER_REGEXES } from '../constants/regexes.js'
import { addressSchema } from './address.js'

const isValidAuthorisationNumber = (authorisationNumber) => {
  const trimmedAuthorisationNumber = authorisationNumber.trim()
  return ALL_SITE_AUTHORISATION_NUMBER_REGEXES.some((regex) =>
    regex.test(trimmedAuthorisationNumber)
  )
}

export const authorisationNumberSchema = Joi.string()
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

export const receiverSchema = Joi.object({
  siteName: Joi.string().required(),
  emailAddress: Joi.string().email(),
  phoneNumber: Joi.string(),
  authorisationNumber: authorisationNumberSchema,
  address: addressSchema.required()
})
