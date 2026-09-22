import {
  ERROR_CATEGORIES,
  ERROR_TYPE,
  getErrorCategory,
  JOI_TYPE_TO_CATEGORY
} from './validation-error-categories'

describe('validation-error-categories', () => {
  describe('ERROR_TYPE', () => {
    it('exposes every category getErrorCategory can return', () => {
      const possibleCategories = new Set([
        ...Object.values(JOI_TYPE_TO_CATEGORY),
        ...ERROR_CATEGORIES,
        'UnexpectedError'
      ])

      expect(new Set(Object.values(ERROR_TYPE))).toEqual(possibleCategories)
    })
  })

  describe('#getErrorCategory', () => {
    it('should return the correct error category for a joi error type', () => {
      const [joiError, errorCategory] = Object.entries(JOI_TYPE_TO_CATEGORY)[0]

      const result = getErrorCategory(joiError)

      expect(result).toEqual(errorCategory)
    })

    it('should return the correct error category for a custom error type with a prefix', () => {
      const errorCategory = ERROR_CATEGORIES[0]

      const result = getErrorCategory(`${errorCategory}.ewcCode`)

      expect(result).toEqual(errorCategory)
    })

    it('should return UnexpectedError for an unknown error type', () => {
      const result = getErrorCategory('object.any')

      expect(result).toEqual('UnexpectedError')
    })
  })
})
