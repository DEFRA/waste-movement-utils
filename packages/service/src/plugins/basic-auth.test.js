import * as func from '../helpers/validate-credentials.js'
import { basicAuth } from './basic-auth.js'
import { serviceCredentials } from '../test/data/service-credentials.js'
import Basic from '@hapi/basic'

describe('#basicAuth', () => {
  it('should set the auth strategy', async () => {
    const mockServer = {
      register: jest.fn(),
      auth: {
        strategy: jest.fn()
      }
    }
    const mockLogger = {
      debug: jest.fn()
    }

    const validateCredentialsSpy = jest.spyOn(func, 'validateCredentials')

    const result = basicAuth(serviceCredentials, mockLogger)

    expect(result.plugin.name).toEqual('basic-auth')

    await result.plugin.register(mockServer)

    expect(mockServer.register).toHaveBeenCalledWith(Basic)

    // Instead of this asserting that mockServer.auth.strategy is called with
    // { validate: validateCredentials(validCredentials) } in the first
    // expect statement, the second expect statement has been added to check
    // that the validateCredentials spy is called
    expect(mockServer.auth.strategy).toHaveBeenCalledWith('basic', 'basic', {
      validate: expect.any(Function)
    })
    expect(validateCredentialsSpy).toHaveBeenCalledWith(
      serviceCredentials,
      mockLogger
    )
  })
})
