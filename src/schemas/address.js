import Joi from 'joi'
import { IRL_POSTCODE_REGEX, UK_POSTCODE_REGEX } from '../constants/regexes.js'
import { ADDRESS_ERRORS } from '../constants/validation-error-messages.js'

export const addressSchema = Joi.object({
  fullAddress: Joi.string(),
  postcode: Joi.alternatives()
    .try(
      Joi.string().pattern(UK_POSTCODE_REGEX),
      Joi.string().pattern(IRL_POSTCODE_REGEX)
    )
    .messages({
      'alternatives.match': ADDRESS_ERRORS.POSTCODE_UK_IRELAND_FORMAT
    })
    .required()
})
