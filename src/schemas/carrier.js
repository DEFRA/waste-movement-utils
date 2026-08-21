import Joi from 'joi'
import { carrierOrBrokerDealerRegistrationNumber } from './carrierOrBrokerDealerRegistrationNumber.js'
import { REASONS_FOR_NO_REGISTRATION_NUMBER } from '../constants/reasons-for-no-registration-number.js'
import { CARRIER_ERRORS } from '../constants/validation-error-messages.js'
import { addressSchema } from './address.js'
import { MEANS_OF_TRANSPORT } from '../constants/means-of-transport.js'

export const carrierSchema = Joi.object({
  registrationNumber: carrierOrBrokerDealerRegistrationNumber
    .allow(null, '')
    .required(),
  reasonForNoRegistrationNumber: Joi.string()
    .valid(...REASONS_FOR_NO_REGISTRATION_NUMBER)
    .allow(null, '')
    .when('registrationNumber', {
      switch: [
        {
          is: null,
          then: Joi.required()
        },
        {
          is: '',
          then: Joi.required()
        }
      ],
      otherwise: Joi.forbidden()
    })
    .messages({
      'string.empty': CARRIER_ERRORS.REGISTRATION_OR_REASON_REQUIRED,
      'string.base': CARRIER_ERRORS.REGISTRATION_OR_REASON_REQUIRED,
      'any.unknown': CARRIER_ERRORS.REASON_ONLY_FOR_NULL,
      'any.only': `${CARRIER_ERRORS.REASON_FOR_NO_REGISTRATION_NUMBER_INVALID_PREFIX} ${REASONS_FOR_NO_REGISTRATION_NUMBER.join(', ')}`
    }),
  organisationName: Joi.string().required(),
  address: addressSchema,
  emailAddress: Joi.string().email(),
  phoneNumber: Joi.string(),
  vehicleRegistration: Joi.when('meansOfTransport', {
    is: Joi.string().required().valid('Road'),
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }).messages({
    'any.required': CARRIER_ERRORS.VEHICLE_REG_REQUIRED_FOR_ROAD,
    'any.unknown': CARRIER_ERRORS.VEHICLE_REG_ONLY_ALLOWED_FOR_ROAD
  }),
  meansOfTransport: Joi.string()
    .valid(...MEANS_OF_TRANSPORT)
    .required(),
  otherMeansOfTransport: Joi.string()
})
