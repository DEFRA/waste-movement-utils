// Captures the golden snapshots in src/openapi/test-fixtures/ from the real
// hapi-swagger 17.3.2, which this package deliberately doesn't depend on. It
// is resolved from a sibling checkout's node_modules instead:
//
//   HAPI_SWAGGER_FROM=../waste-movement-backend node scripts/capture-openapi-golden.js
//
// Only re-run this to re-baseline against hapi-swagger itself; the snapshots
// are the contract `generateOpenApi` is tested against.
import { createRequire } from 'node:module'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import Hapi from '@hapi/hapi'
import { goldenCases } from '../src/openapi/test-fixtures/routes.js'

const from = path.resolve(
  process.env.HAPI_SWAGGER_FROM ?? '../waste-movement-backend'
)
const require = createRequire(path.join(from, 'package.json'))
const HapiSwagger = require('hapi-swagger')
const { version } = require('hapi-swagger/package.json')

if (version !== '17.3.2') {
  throw new Error(`Expected hapi-swagger 17.3.2, found ${version} in ${from}`)
}

const fixturesDir = path.resolve('src/openapi/test-fixtures')

for (const { name, routes, options } of goldenCases) {
  const server = Hapi.server()
  await server.register({
    plugin: HapiSwagger,
    options: { ...options, swaggerUI: false, documentationPage: false }
  })
  server.route(routes)

  const res = await server.inject('/swagger.json')
  if (res.statusCode !== 200) {
    throw new Error(`${name}: ${res.statusCode} ${res.payload}`)
  }

  const file = path.join(fixturesDir, `${name}.json`)
  await writeFile(file, `${JSON.stringify(res.result, null, 2)}\n`)
  console.log(`wrote ${path.relative(process.cwd(), file)}`)
}
