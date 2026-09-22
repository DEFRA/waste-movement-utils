export const ERROR_TYPE = {
  NOT_PROVIDED: 'NotProvided',
  NOT_ALLOWED: 'NotAllowed',
  INVALID_TYPE: 'InvalidType',
  INVALID_FORMAT: 'InvalidFormat',
  INVALID_VALUE: 'InvalidValue',
  OUT_OF_RANGE: 'OutOfRange',
  BUSINESS_RULE_VIOLATION: 'BusinessRuleViolation',
  UNEXPECTED_ERROR: 'UnexpectedError'
}

export const JOI_TYPE_TO_CATEGORY = {
  // NotProvided
  'any.required': ERROR_TYPE.NOT_PROVIDED,
  'object.missing': ERROR_TYPE.NOT_PROVIDED,
  'object.with': ERROR_TYPE.NOT_PROVIDED,

  // NotAllowed
  'object.unknown': ERROR_TYPE.NOT_ALLOWED,
  'any.unknown': ERROR_TYPE.NOT_ALLOWED,

  // InvalidType
  'string.base': ERROR_TYPE.INVALID_TYPE,
  'number.base': ERROR_TYPE.INVALID_TYPE,
  'boolean.base': ERROR_TYPE.INVALID_TYPE,
  'array.base': ERROR_TYPE.INVALID_TYPE,
  'object.base': ERROR_TYPE.INVALID_TYPE,
  'date.base': ERROR_TYPE.INVALID_TYPE,

  // InvalidFormat
  'string.email': ERROR_TYPE.INVALID_FORMAT,
  'string.uuid': ERROR_TYPE.INVALID_FORMAT,
  'string.guid': ERROR_TYPE.INVALID_FORMAT,
  'string.pattern.base': ERROR_TYPE.INVALID_FORMAT,
  'date.format': ERROR_TYPE.INVALID_FORMAT,
  'alternatives.match': ERROR_TYPE.INVALID_FORMAT,

  // InvalidValue
  'any.only': ERROR_TYPE.INVALID_VALUE,
  'any.invalid': ERROR_TYPE.INVALID_VALUE,
  'string.empty': ERROR_TYPE.INVALID_VALUE,

  // OutOfRange
  'string.min': ERROR_TYPE.OUT_OF_RANGE,
  'string.max': ERROR_TYPE.OUT_OF_RANGE,
  'number.min': ERROR_TYPE.OUT_OF_RANGE,
  'number.max': ERROR_TYPE.OUT_OF_RANGE,
  'number.positive': ERROR_TYPE.OUT_OF_RANGE,
  'number.negative': ERROR_TYPE.OUT_OF_RANGE,
  'number.integer': ERROR_TYPE.OUT_OF_RANGE,
  'array.min': ERROR_TYPE.OUT_OF_RANGE,
  'array.max': ERROR_TYPE.OUT_OF_RANGE
}

export const ERROR_CATEGORIES = [
  ERROR_TYPE.INVALID_TYPE,
  ERROR_TYPE.INVALID_FORMAT,
  ERROR_TYPE.INVALID_VALUE,
  ERROR_TYPE.OUT_OF_RANGE,
  ERROR_TYPE.BUSINESS_RULE_VIOLATION
]

export function getErrorCategory(joiErrorType) {
  if (JOI_TYPE_TO_CATEGORY[joiErrorType]) {
    return JOI_TYPE_TO_CATEGORY[joiErrorType]
  }

  // Check for custom error types with category prefix (e.g., 'InvalidFormat.ewcCode')
  for (const prefix of ERROR_CATEGORIES) {
    if (joiErrorType.startsWith(`${prefix}.`)) {
      return prefix
    }
  }

  return ERROR_TYPE.UNEXPECTED_ERROR
}
