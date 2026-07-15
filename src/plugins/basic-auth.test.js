import { basicAuth, validate } from './basic-auth.js'

const serviceCredentials = [
  'd2FzdGUtbW92ZW1lbnQtZXh0ZXJuYWwtYXBpPTRkNWQ0OGNiLTQ1NmEtNDcwYS04ODE0LWVhZTI3NThiZTkwZA==',
  'd2FzdGUtbW92ZW1lbnQtYmFja2VuZD0yNjZhMmJiZi0xOWEwLTQ3OTUtODI4Zi1kZWI3Njc4MWM3OTc='
]

describe('validate', () => {
  it('returns isValid false when serviceCredentials is null', async () => {
    const result = await validate(null)({}, 'testuser', 'testpass')

    expect(result).toEqual({
      isValid: false,
      credentials: { username: 'testuser' }
    })
  })

  it('returns isValid false when serviceCredentials is undefined', async () => {
    const result = await validate(undefined)({}, 'testuser', 'testpass')

    expect(result).toEqual({
      isValid: false,
      credentials: { username: 'testuser' }
    })
  })

  it('returns isValid false when serviceCredentials is an empty array', async () => {
    const result = await validate([])({}, 'testuser', 'testpass')

    expect(result).toEqual({
      isValid: false,
      credentials: { username: 'testuser' }
    })
  })

  it('returns isValid true when credentials match', async () => {
    const result = await validate(serviceCredentials)(
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
    const result = await validate(serviceCredentials)(
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
    const result = await validate(serviceCredentials)(
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

describe('#basicAuth', () => {
  it('should set the auth strategy', async () => {
    const mockServer = {
      register: jest.fn(),
      auth: {
        strategy: jest.fn()
      }
    }

    await basicAuth(serviceCredentials).plugin.register(mockServer)

    expect(mockServer.register).toHaveBeenCalled()
    expect(mockServer.auth.strategy).toHaveBeenCalled()
  })
})
