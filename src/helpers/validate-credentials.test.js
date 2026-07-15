import { validateCredentials } from './validate-credentials.js'
import { serviceCredentials } from '../test/data/service-credentials.js'

describe('#validateCredentials', () => {
  it('returns isValid false when serviceCredentials is null', async () => {
    const result = await validateCredentials(null)({}, 'testuser', 'testpass')

    expect(result).toEqual({
      isValid: false,
      credentials: { username: 'testuser' }
    })
  })

  it('returns isValid false when serviceCredentials is undefined', async () => {
    const result = await validateCredentials(undefined)(
      {},
      'testuser',
      'testpass'
    )

    expect(result).toEqual({
      isValid: false,
      credentials: { username: 'testuser' }
    })
  })

  it('returns isValid false when serviceCredentials is an empty array', async () => {
    const result = await validateCredentials([])({}, 'testuser', 'testpass')

    expect(result).toEqual({
      isValid: false,
      credentials: { username: 'testuser' }
    })
  })

  it('returns isValid true when credentials match', async () => {
    const result = await validateCredentials(serviceCredentials)(
      {},
      'waste-movement-external-api',
      '4d5d48cb-456a-470a-8814-eae2758be90d'
    )

    expect(result).toEqual({
      isValid: true,
      credentials: { username: 'waste-movement-external-api' }
    })
  })

  it('returns isValid false when username does not match', async () => {
    const result = await validateCredentials(serviceCredentials)(
      {},
      'wronguser',
      '4d5d48cb-456a-470a-8814-eae2758be90d'
    )

    expect(result).toEqual({
      isValid: false,
      credentials: { username: 'wronguser' }
    })
  })

  it('returns isValid false when password does not match', async () => {
    const result = await validateCredentials(serviceCredentials)(
      {},
      'waste-movement-external-api',
      'wrongpass'
    )

    expect(result).toEqual({
      isValid: false,
      credentials: { username: 'waste-movement-external-api' }
    })
  })
})
