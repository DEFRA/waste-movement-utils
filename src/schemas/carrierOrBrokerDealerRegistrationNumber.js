import Joi from 'joi'
import { ALL_CARRIER_REGISTRATION_NUMBER_REGEXES } from '../constants/regexes.js'
import { CARRIER_ERRORS } from '../constants/validation-error-messages.js'

export const carrierOrBrokerDealerRegistrationNumber = Joi.alternatives()
  .try(
    ...ALL_CARRIER_REGISTRATION_NUMBER_REGEXES.map((regex) =>
      Joi.string().pattern(regex)
    )
  )
  .messages({
    'alternatives.match': CARRIER_ERRORS.REGISTRATION_NUMBER_FORMAT
  })
