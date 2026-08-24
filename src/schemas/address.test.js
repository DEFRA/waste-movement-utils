import { addressSchema } from './address.js'

const validAddress = {
  fullAddress: '1 South East London Road, London',
  postcode: 'SE1 1SE'
}
const invalidAddress = {
  fullAddress: '1 South East London Road, London',
  postcode: 'SE1 1SEEE'
}

describe('address Schema', () => {
  it('should accept valid payload', () => {
    const { error } = addressSchema.validate(validAddress)

    expect(error).toBeUndefined()
  })

  it('should return an error when payload is invalid', () => {
    const { error } = addressSchema.validate(invalidAddress)

    expect(error).toBeDefined()
    expect(error.message).toEqual(
      '"postcode" must be in valid UK or Ireland format'
    )
  })
})
