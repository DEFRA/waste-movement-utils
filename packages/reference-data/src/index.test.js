import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as referenceData from './index.js'

const NAMES = [
  'ALL_CARRIER_REGISTRATION_NUMBER_REGEXES',
  'ALL_SITE_AUTHORISATION_NUMBER_REGEXES',
  'DISPOSAL_CODES',
  'DISPOSAL_OR_RECOVERY_CODES',
  'IRL_POSTCODE_REGEX',
  'MEANS_OF_TRANSPORT',
  'NO_CONSIGNMENT_REASONS',
  'REASONS_FOR_NO_REGISTRATION_NUMBER',
  'RECOVERY_CODES',
  'SCOTLAND_EAS_SIX_DIGIT_SITE_AUTHORISATION_NUMBER_REGEX',
  'UK_POSTCODE_REGEX',
  'concentrationOperators',
  'hazardousPropertyCodes',
  'isValidContainerType',
  'isValidEwcCode',
  'isValidHazardousEwcCode',
  'isValidPopCode',
  'sourceOfComponentsNotProvided',
  'sourceOfComponentsProvided',
  'validContainerTypes',
  'validEwcCodes',
  'validHazCodes',
  'validPopNames',
  'validSourceOfComponents'
]

const PACKAGE = 'packages/reference-data'
const constantsFiles = readdirSync(`${PACKAGE}/src/constants`).filter((file) =>
  file.endsWith('.js')
)

// Node loads a copy from outside the repository through `main`, as a service
// does, so the package cannot lean on a file or a dependency of the library
const namesInNode = () => {
  const copy = mkdtempSync(join(tmpdir(), 'reference-data-'))

  try {
    cpSync(PACKAGE, copy, { recursive: true })
    const { main } = JSON.parse(
      readFileSync(join(copy, 'package.json'), 'utf8')
    )

    return JSON.parse(
      execFileSync(
        process.execPath,
        [
          '--input-type=module',
          '--eval',
          'console.log(JSON.stringify(Object.keys(await import(process.argv[1]))))',
          pathToFileURL(join(copy, main)).href
        ],
        { encoding: 'utf8' }
      )
    )
  } finally {
    rmSync(copy, { recursive: true })
  }
}

describe('index', () => {
  // Node drops a name two modules export and Babel can keep it, so both are asked
  it('exports the reference data names, and no other', () => {
    expect(namesInNode()).toEqual(NAMES)
    expect(Object.keys(referenceData).sort()).toEqual(NAMES)
  })

  // The library keeps its own copy of each file until it depends on this package
  it.each(constantsFiles)('holds the same %s as the library', (file) => {
    expect(readFileSync(`${PACKAGE}/src/constants/${file}`, 'utf8')).toBe(
      readFileSync(`src/constants/${file}`, 'utf8')
    )
  })
})
