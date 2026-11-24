const isValidationDetail = (detail) =>
  typeof detail?.message === 'string' &&
  Array.isArray(detail.path) &&
  typeof detail.type === 'string'

const getValidationDetails = (boomError) => {
  const details = boomError.details ?? boomError.data?.details

  if (Array.isArray(details) && details.every(isValidationDetail)) {
    return details
  }

  return null
}

const summarizeValidationDetails = (validationDetails) =>
  `${validationDetails.length} validation error${validationDetails.length === 1 ? '' : 's'} occurred`

export class ProblemDetails {
  /**
   * @param {object} opts
   * @param {string} [opts.type]        - URI identifying the problem type
   * @param {string} [opts.title]       - Short, human-readable summary
   * @param {number} opts.status        - HTTP status code
   * @param {string} [opts.detail]      - Human-readable explanation specific to this occurrence
   * @param {string} [opts.instance]    - URI identifying this specific occurrence
   * @param {object} [opts.extensions]  - Additional custom members
   * @param {object} [opts.headers]     - Pre-existing headers
   */

  #headers
  #status

  constructor({
    type,
    title,
    status,
    detail,
    instance,
    extensions = {},
    headers = {}
  } = {}) {
    this.type = type || 'about:blank'
    this.title = title
    if (detail) this.detail = detail
    if (instance) this.instance = instance
    Object.assign(this, extensions)
    this.#status = status
    this.#headers = headers
  }

  /**
   * Build a ProblemDetails instance from a Hapi Boom error.
   * @param {import('@hapi/boom').Boom} boomError
   * @param {object} [opts]
   * @param {string} [opts.instance]   - e.g. request.path or request.info.id
   * @param {string} [opts.typeBase]   - base URI to prefix error codes with, e.g. 'https://api.example.com/errors/'
   * @param {boolean} [opts.exposeValidation=true] - include Joi/validation details if present
   */
  static fromBoom(boomError, opts = {}) {
    const { instance, typeBase, requestId, exposeValidation = true } = opts
    const { statusCode, payload, headers } = boomError.output
    const extensions = {}
    const validationDetails = getValidationDetails(boomError)

    if (exposeValidation && validationDetails) {
      extensions.errors = validationDetails.map((d) => ({
        message: d.message,
        pointer: `/${d.path.join('/')}`,
        errorType: d.type
      }))
    }

    if (requestId) {
      extensions.requestId = requestId
    }

    const errorCode = payload.error
      ? payload.error.toLowerCase().replace(/\s+/g, '-')
      : 'error'

    return new ProblemDetails({
      type: typeBase ? `${typeBase}${errorCode}` : undefined,
      title: payload.error,
      status: statusCode,
      detail:
        statusCode !== 500 &&
        (validationDetails
          ? summarizeValidationDetails(validationDetails)
          : boomError.message),
      instance,
      extensions,
      headers
    })
  }

  /**
   * Converts this object into a Hapi response formatted as an RFC 7807
   * "problem+json" HTTP API problem response.
   * @param {import('@hapi/hapi').ResponseToolkit} h - The Hapi response toolkit, used to build the response.
   * @returns {import('@hapi/hapi').ResponseObject} The Hapi response object with this instance as the body,
   *   the status code set to `this.status`, and content type `application/problem+json`, also preserving pre-exising headers.
   */
  toHapiResponse(h) {
    const response = h
      .response(this)
      .code(this.#status)
      .type('application/problem+json')

    for (const [key, value] of Object.entries(this.#headers)) {
      if (value === undefined) continue
      if (key.toLowerCase() === 'content-type') continue // don't clobber the RFC 9457 content type

      response.header(key, value)
    }

    if (this.requestId) {
      response.header('x-request-id', this.requestId)
    }

    return response
  }

  toJSON() {
    const { type, title, detail, instance, ...rest } = this
    return {
      type,
      title,
      ...(detail && { detail }),
      ...(instance && { instance }),
      ...rest
    }
  }
}
