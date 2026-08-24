import { MEANS_OF_TRANSPORT } from '../constants/means-of-transport.js'
import { validPopNames } from '../constants/pop-names.js'
import {
  sourceOfComponentsNotProvided,
  sourceOfComponentsProvided
} from '../constants/source-of-components.js'
import { movementSchema } from './movement.js'
import { randomUUID } from 'node:crypto'

const validMovement = {
  apiCode: randomUUID(),
  estimatedDateTimeCollected: '2025-08-29T15:24:00Z',
  otherReferencesForMovement: [
    {
      label: 'otherReferencesForMovementLabel',
      reference: 'otherReferencesForMovementReference'
    }
  ],
  specialHandlingRequirements: 'Please be careful with this waste',
  producer: {
    wasteSource: 'Municipal',
    organisationName: 'organisationName',
    authorisationNumber: 'authorisationNumber',
    sicCode: '12345',
    emailAddress: 'email@address.com',
    phoneNumber: '07766011999',
    address: {
      fullAddress: '1 South East London Road, London',
      postcode: 'SE1 1SE'
    },
    councilMovement: false
  },
  carrier: {
    registrationNumber: '',
    reasonForNoRegistrationNumber: 'ON_SITE',
    organisationName: 'Test Carrier',
    meansOfTransport: MEANS_OF_TRANSPORT[1]
  },
  wasteItems: [
    {
      ewcCodes: ['200101'],
      wasteDescription: 'Default test waste description',
      physicalForm: 'Solid',
      numberOfContainers: 1,
      typeOfContainers: 'SKI',
      weight: {
        metric: 'Tonnes',
        amount: 1.0,
        isEstimate: false
      },
      containsPops: true,
      pops: {
        sourceOfComponents: sourceOfComponentsProvided.PROVIDED_WITH_WASTE,
        components: [
          {
            code: validPopNames[0].code,
            concentration: 10
          }
        ]
      },
      containsHazardous: false,
      hazardous: {
        sourceOfComponents: sourceOfComponentsNotProvided.NOT_PROVIDED
      }
    }
  ],
  isDeleted: false
}

describe('movement Schema', () => {
  it('should accept valid payload', () => {
    const { error } = movementSchema.validate(validMovement)

    expect(error).toBeUndefined()
  })

  it('should return an error when wasteItems arent provided', () => {
    const invalidMovement = { ...validMovement, wasteItems: undefined }
    const { error } = movementSchema.validate(invalidMovement)

    expect(error).toBeDefined()
    expect(error.message).toEqual('"wasteItems" is required')
  })

  it('should return an error when producer details arent provided', () => {
    const invalidMovement = { ...validMovement, producer: undefined }
    const { error } = movementSchema.validate(invalidMovement)

    expect(error).toBeDefined()
    expect(error.message).toEqual('"producer" is required')
  })

  it('should return an error when carrier details arent provided', () => {
    const invalidMovement = { ...validMovement, carrier: undefined }
    const { error } = movementSchema.validate(invalidMovement)

    expect(error).toBeDefined()
    expect(error.message).toEqual('"carrier" is required')
  })
})
