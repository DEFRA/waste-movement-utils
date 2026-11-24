import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const readManifest = (folder) =>
  JSON.parse(readFileSync(join(folder, 'package.json'), 'utf8'))

// The umbrella at the root, then the packages it re-exports
const folders = [
  '.',
  ...readdirSync('packages', { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join('packages', entry.name))
]

const packages = folders.map((folder) => [readManifest(folder).name, folder])

const versionHere = Object.fromEntries(
  folders.map(readManifest).map(({ name, version }) => [name, version])
)

// Each package's whole dependency list. An addition reaches every service that installs the package
const ALLOWED_DEPENDENCIES = {
  '@defra/waste-movement-utils': [
    '@defra/waste-movement-utils-http-errors',
    '@defra/waste-movement-utils-reference-data',
    '@defra/waste-movement-utils-service',
    'joi'
  ],
  '@defra/waste-movement-utils-http-errors': [],
  '@defra/waste-movement-utils-reference-data': [],
  '@defra/waste-movement-utils-service': ['@hapi/basic']
}

// from 'joi' and import 'joi' name a package; './weight.js' and 'node:crypto' do not
const PACKAGE_IMPORT = /(?:from|import) '(?!\.|node:)([^']+)'/g
const FILE_IMPORT = /(?:from|import) '(\.[^']+)'/g

describe.each(packages)('%s', (name, folder) => {
  const { dependencies = {} } = readManifest(folder)
  const src = join(folder, 'src')

  // Consumers get every file under src, and never run the tests
  const publishedFiles = readdirSync(src, { recursive: true })
    .filter((file) => file.endsWith('.js') && !file.endsWith('.test.js'))
    .map((file) => join(src, file))

  const importsIn = (file, pattern) =>
    [...readFileSync(file, 'utf8').matchAll(pattern)].map(
      ([, specifier]) => specifier
    )

  it('declares the dependencies it is allowed, and no other', () => {
    expect(Object.keys(dependencies).sort()).toEqual(ALLOWED_DEPENDENCIES[name])
  })

  it('depends on exactly the packages its published files import', () => {
    const importedPackages = publishedFiles.flatMap((file) =>
      importsIn(file, PACKAGE_IMPORT)
    )

    expect(new Set(Object.keys(dependencies))).toEqual(
      new Set(importedPackages)
    )
  })

  // A consumer installs the pinned version from npm, never the folder beside it
  it('pins each package of this repository to the version it has here', () => {
    const ownPackages = Object.keys(dependencies).filter(
      (dependency) => versionHere[dependency]
    )

    expect(
      ownPackages.map((dependency) => [dependency, dependencies[dependency]])
    ).toEqual(
      ownPackages.map((dependency) => [dependency, versionHere[dependency]])
    )
  })

  it('imports no file outside its own src', () => {
    const filesOutside = publishedFiles.flatMap((file) =>
      importsIn(file, FILE_IMPORT)
        .map((path) => relative(src, resolve(dirname(file), path)))
        .filter((path) => path.startsWith('..'))
    )

    expect(filesOutside).toEqual([])
  })
})
