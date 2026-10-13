import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Hapi from '@hapi/hapi'
import { generateOpenApi } from './index.js'
import { goldenCases, fixtureRoutes } from './test-fixtures/routes.js'

const fixturesDir = path.join(__dirname, 'test-fixtures')

const tableFor = (routes) => {
  const server = Hapi.server()
  server.route(routes)
  return server.table()
}

describe('generateOpenApi', () => {
  // The golden files were captured from hapi-swagger 17.3.2 itself, by
  // scripts/capture-openapi-golden.js
  it.each(goldenCases)(
    'matches hapi-swagger 17.3.2 for the $name case',
    async ({ name, routes, options }) => {
      const expected = JSON.parse(
        await readFile(path.join(fixturesDir, `${name}.json`), 'utf8')
      )

      const spec = await generateOpenApi(tableFor(routes), options)

      expect(spec).toEqual(expected)
    }
  )

  it('produces JSON-serialisable output', async () => {
    const { options } = goldenCases[0]
    const spec = await generateOpenApi(tableFor(fixtureRoutes), options)

    expect(JSON.parse(JSON.stringify(spec))).toEqual(spec)
  })

  it('ignores UI-only hapi-swagger options', async () => {
    const { options } = goldenCases[0]
    const withUiOptions = {
      ...options,
      documentationPath: '/',
      swaggerUIPath: '/swaggerui',
      jsonPath: '/swagger.json',
      swaggerUI: true,
      documentationPage: true,
      debug: true
    }

    expect(
      await generateOpenApi(tableFor(fixtureRoutes), withUiOptions)
    ).toEqual(await generateOpenApi(tableFor(fixtureRoutes), options))
  })

  it('does not mutate the options it is given', async () => {
    const { options } = goldenCases[0]
    const copy = structuredClone({ ...options, routeTag: undefined })

    await generateOpenApi(tableFor(fixtureRoutes), options)

    expect({ ...options, routeTag: undefined }).toEqual(copy)
  })

  it.each([
    ['host', { host: undefined }],
    ['schemes', { schemes: undefined }]
  ])('requires %s for Swagger 2.0', async (_name, override) => {
    await expect(
      generateOpenApi(tableFor(fixtureRoutes), {
        ...goldenCases[0].options,
        ...override
      })
    ).rejects.toThrow('`host` and `schemes` are required')
  })

  it('requires servers for OpenAPI 3.0', async () => {
    await expect(
      generateOpenApi(tableFor(fixtureRoutes), {
        ...goldenCases[0].options,
        OAS: 'v3.0'
      })
    ).rejects.toThrow('`servers` is required')
  })

  it('generates OpenAPI 3.0 when servers are given', async () => {
    const { host, schemes, ...options } = goldenCases[0].options
    const spec = await generateOpenApi(tableFor(fixtureRoutes), {
      ...options,
      OAS: 'v3.0',
      servers: [{ url: 'https://fixture.example.test' }]
    })

    expect(spec.openapi).toBe('3.0.0')
    expect(spec.servers).toEqual([{ url: 'https://fixture.example.test' }])
  })
})
