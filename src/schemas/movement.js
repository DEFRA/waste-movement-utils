import Joi from 'joi'
import { hazardousWasteConsignmentCodeSchema } from './hazardous-waste-consignment.js'
import { brokerOrDealerSchema } from './brokerOrDealer.js'
import { carrierSchema } from './carrier.js'
import { receiverSchema } from './receiver.js'
import { wasteItemsSchema } from './waste.js'
import { producerSchema } from './producer.js'

const MIN_STRING_LENGTH = 1
const LONG_STRING_MAX_LENGTH = 5000

export const movementSchema = Joi.object({
  apiCode: Joi.string(),
  estimatedDateTimeCollected: Joi.date().iso(),
  hazardousWasteConsignmentCode: hazardousWasteConsignmentCodeSchema,
  reasonForNoConsignmentCode: Joi.string().allow(null, ''),
  otherReferencesForMovement: Joi.array().items(
    Joi.object({
      label: Joi.string().min(MIN_STRING_LENGTH).required(),
      reference: Joi.string().min(MIN_STRING_LENGTH).required()
    })
  ),
  specialHandlingRequirements: Joi.string().max(LONG_STRING_MAX_LENGTH),
  producer: producerSchema.required(),
  carrier: carrierSchema.required(),
  brokerOrDealer: brokerOrDealerSchema,
  receiver: receiverSchema,
  wasteItems: Joi.array().items(wasteItemsSchema).required().min(1),
  isDeleted: Joi.boolean().strict()
})
