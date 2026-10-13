import { dereference } from './vendor/dereference.cjs'

describe('vendored dereference', () => {
  it('inlines nested local refs', async () => {
    const schema = {
      definitions: {
        A: { type: 'object', properties: { b: { $ref: '#/definitions/B' } } },
        B: { type: 'string' }
      },
      paths: { x: { schema: { $ref: '#/definitions/A' } } }
    }

    const out = await dereference(schema)

    expect(out.paths.x.schema).toEqual({
      type: 'object',
      properties: { b: { type: 'string' } }
    })
  })

  it('decodes JSON pointer escapes', async () => {
    const schema = {
      definitions: { 'a/b~c d': { type: 'number' } },
      x: { $ref: '#/definitions/a~1b~0c%20d' }
    }

    expect((await dereference(schema)).x).toEqual({ type: 'number' })
  })

  it('does not mutate its input', async () => {
    const schema = {
      definitions: { A: { type: 'string' } },
      x: { $ref: '#/definitions/A' }
    }
    const copy = structuredClone(schema)

    await dereference(schema)

    expect(schema).toEqual(copy)
  })

  it.each([
    [
      'circular',
      { definitions: { A: { items: { $ref: '#/definitions/A' } } } },
      'Circular ref "#/definitions/A"'
    ],
    [
      'extended',
      {
        definitions: { A: { type: 'string' } },
        x: { $ref: '#/definitions/A', description: 'own' }
      },
      'Refs with sibling keys are not supported'
    ],
    [
      'external',
      { x: { $ref: 'other.json#/A' } },
      'Only local refs are supported'
    ],
    [
      'unresolvable',
      { x: { $ref: '#/definitions/Missing' } },
      'Unresolvable ref "#/definitions/Missing"'
    ]
  ])('throws on %s refs', async (_name, schema, message) => {
    await expect(dereference(schema)).rejects.toThrow(message)
  })
})
