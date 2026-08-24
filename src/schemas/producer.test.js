import { producerSchema } from './producer.js'

const validProducer = {
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
}
const invalidProducer = {
  wasteSource: 'BADVALUE',
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
}

describe('producer Schema', () => {
  it('should accept valid payload', () => {
    const { error } = producerSchema.validate(validProducer)

    expect(error).toBeUndefined()
  })

  it('should return an error when payload is invalid', () => {
    const { error } = producerSchema.validate(invalidProducer)

    expect(error).toBeDefined()
    expect(error.message).toEqual(
      '"wasteSource" must be one of [Household, Commercial, Municipal]'
    )
  })
})
