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
/*
  // Commercial: business identity is mandatory.
  .when('wasteSource', {
    is: 'Commercial',
    then: Joi.object({
      organisationName: Joi.string().required(),
      authorisationNumber: Joi.string().required(),
      sicCode: Joi.string()
        .pattern(/^\d{5}$/)
        .required()
    })
  })
  // Household: business-only fields are forbidden.
  .when('wasteSource', {
    is: 'Household',
    then: Joi.object({
      organisationName: Joi.forbidden(),
      authorisationNumber: Joi.forbidden(),
      sicCode: Joi.forbidden(),
      emailAddress: Joi.forbidden(),
      phoneNumber: Joi.forbidden()
    })
  })
    */
