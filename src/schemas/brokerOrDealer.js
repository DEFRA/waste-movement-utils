import Joi from 'joi'
import { addressSchema } from './address.js'
import { carrierOrBrokerDealerRegistrationNumber } from './carrierOrBrokerDealerRegistrationNumber.js'

export const brokerOrDealerSchema = Joi.object({
  organisationName: Joi.string().required(),
  address: addressSchema,
  registrationNumber: carrierOrBrokerDealerRegistrationNumber,
  phoneNumber: Joi.string(),
  emailAddress: Joi.string().email()
})
