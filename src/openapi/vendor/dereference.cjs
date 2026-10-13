// Replaces `@apidevtools/json-schema-ref-parser` for `builder.cjs`, which only
// ever dereferences the local `#/definitions/*` (or `#/components/*`) refs it
// generated itself: plain `{ $ref }` objects, each replaced by its
// (recursively dereferenced) target, matching json-schema-ref-parser 11.x.
//
// Anything else throws rather than risk silently diverging from it:
// - external/remote refs
// - "extended" refs (`$ref` plus sibling keys), which json-schema-ref-parser
//   merges differently depending on its internal cache order, and which
//   hapi-swagger never emits
// - circular refs, which json-schema-ref-parser turns into a cyclic object
//   that couldn't be serialised anyway

const decodeToken = (token) => {
  const unescaped = token.replace(/~1/g, '/').replace(/~0/g, '~')
  try {
    return decodeURIComponent(unescaped)
  } catch {
    return unescaped
  }
}

const resolvePointer = (root, ref) => {
  if (!ref.startsWith('#/')) {
    throw new Error(`Only local refs are supported, got "${ref}"`)
  }

  return ref
    .slice(2)
    .split('/')
    .map(decodeToken)
    .reduce((node, token) => {
      if (node === null || typeof node !== 'object' || !(token in node)) {
        throw new Error(`Unresolvable ref "${ref}"`)
      }
      return node[token]
    }, root)
}

const walk = (node, root, seen) => {
  if (Array.isArray(node)) {
    return node.map((item) => walk(item, root, seen))
  }

  if (node === null || typeof node !== 'object') {
    return node
  }

  if (typeof node.$ref === 'string') {
    const ref = node.$ref
    if (Object.keys(node).length > 1) {
      throw new Error(`Refs with sibling keys are not supported, at "${ref}"`)
    }
    if (seen.includes(ref)) {
      throw new Error(`Circular ref "${ref}"`)
    }

    return walk(resolvePointer(root, ref), root, [...seen, ref])
  }

  const out = {}
  for (const [key, value] of Object.entries(node)) {
    out[key] = walk(value, root, seen)
  }
  return out
}

module.exports = {
  // async to keep json-schema-ref-parser's signature
  dereference: async (schema) => walk(schema, schema, [])
}
