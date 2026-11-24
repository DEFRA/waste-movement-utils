import {
  isValidEwcCode,
  isValidHazardousEwcCode,
  validEwcCodes
} from './ewc-codes.js'

// The 42 codes the EU added from 9 December 2026, and whether it marks each hazardous (DWTC-264)
const NEW_EWC_CODES = [
  ['100821', true],
  ['100822', false],
  ['100823', true],
  ['100824', false],
  ['100825', true],
  ['100826', false],
  ['160607', true],
  ['160608', true],
  ['160609', true],
  ['160610', true],
  ['160611', true],
  ['160612', false],
  ['160613', true],
  ['160614', true],
  ['160615', false],
  ['160622', true],
  ['160623', false],
  ['160624', true],
  ['160625', false],
  ['160626', true],
  ['160627', false],
  ['160628', true],
  ['160629', false],
  ['160630', true],
  ['160631', false],
  ['160632', true],
  ['160633', false],
  ['160634', true],
  ['160635', false],
  ['190212', true],
  ['190213', true],
  ['191401', true],
  ['191402', true],
  ['191403', true],
  ['191404', true],
  ['191405', true],
  ['191406', true],
  ['191407', true],
  ['191408', false],
  ['200142', true],
  ['200143', true],
  ['200144', false]
]

const ENTRY_TYPES = [
  'Absolute hazardous',
  'Absolute non-hazardous',
  'Mirror hazardous',
  'Mirror non-hazardous'
]

describe('validEwcCodes', () => {
  it('should list 884 codes, each once, in ascending order', () => {
    const codes = validEwcCodes.map(({ code }) => code)

    expect(codes).toHaveLength(884)
    expect(codes).toEqual([...new Set(codes)].sort())
  })

  // The entry type is an Environment Agency classification the EU list does not give, so it is blank
  it.each(NEW_EWC_CODES)(
    'should list new code %s once, with isHazardous %s and a blank entry type',
    (code, isHazardous) => {
      const entries = validEwcCodes.filter((entry) => entry.code === code)

      expect(entries).toEqual([
        {
          code,
          isHazardous,
          entryTypeDesc: '',
          chapter: expect.stringMatching(/\S/),
          subChapter: expect.stringMatching(/\S/),
          description: expect.stringMatching(/\S/)
        }
      ])
    }
  )

  it('should leave every other code with one of the four entry types', () => {
    const newCodes = NEW_EWC_CODES.map(([code]) => code)
    const otherEntryTypes = validEwcCodes
      .filter(({ code }) => !newCodes.includes(code))
      .map(({ entryTypeDesc }) => entryTypeDesc)

    expect(otherEntryTypes).toHaveLength(842)
    expect(new Set(otherEntryTypes)).toEqual(new Set(ENTRY_TYPES))
  })
})

describe('#isValidEwcCode', () => {
  it.each(NEW_EWC_CODES)('should return true for new code %s', (code) => {
    expect(isValidEwcCode(code)).toBe(true)
  })

  // The EU removed these four; they stay valid until UK legislation follows (DWTC-256)
  it.each(['160605', '190211', '200133', '200134'])(
    'should still return true for %s',
    (code) => {
      expect(isValidEwcCode(code)).toBe(true)
    }
  )
})

describe('#isValidHazardousEwcCode', () => {
  it.each(NEW_EWC_CODES)(
    'should say whether new code %s is hazardous (%s)',
    (code, isHazardous) => {
      expect(isValidHazardousEwcCode(code)).toBe(isHazardous)
    }
  )
})
