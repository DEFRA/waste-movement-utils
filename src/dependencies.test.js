import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const { dependencies } = JSON.parse(readFileSync('package.json', 'utf8'))

// Consumers get every file under src, and never run the tests
const publishedFiles = readdirSync('src', { recursive: true }).filter(
  (file) => file.endsWith('.js') && !file.endsWith('.test.js')
)

// from 'joi' names a package; from './weight.js' and from 'node:crypto' do not
const PACKAGE_IMPORT = /from '(?!\.|node:)([^']+)'/g

describe('dependencies', () => {
  it('are exactly the packages the published files import', () => {
    const importedPackages = publishedFiles.flatMap((file) =>
      [...readFileSync(join('src', file), 'utf8').matchAll(PACKAGE_IMPORT)].map(
        ([, name]) => name
      )
    )

    expect(new Set(Object.keys(dependencies))).toEqual(
      new Set(importedPackages)
    )
  })
})
