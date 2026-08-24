import Joi from 'joi'
import { addressSchema } from './address.js'

export const producerSchema = Joi.object({
  wasteSource: Joi.string()
    .valid('Household', 'Commercial', 'Municipal')
    .required(),

  organisationName: Joi.string(),
  authorisationNumber: Joi.string(),

  sicCode: Joi.string().pattern(/^\d{5}$/),

  emailAddress: Joi.string().email(),
  phoneNumber: Joi.string(),

  address: addressSchema.required(),

  councilMovement: Joi.boolean().required()
})
