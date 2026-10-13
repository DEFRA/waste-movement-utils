# Vendored hapi-swagger core

Near-literal copies of [hapi-swagger](https://github.com/hapi-swagger/hapi-swagger)
**17.3.2**'s `lib/` (MIT, see `LICENSE`), the Joi → Swagger 2.0 part only. They
back `generateOpenApi` in `../index.js`, which produces the spec at build time
so services no longer need hapi-swagger, which is archived, or its
dependencies, which security scanners keep flagging.

The files keep upstream's code style and are excluded from ESLint, Prettier and
coverage. `../index.test.js` checks the output against golden snapshots captured
from hapi-swagger 17.3.2 itself (`scripts/capture-openapi-golden.js`).

## Copied

`builder`, `defaults`, `definitions`, `filter`, `group`, `info`, `parameters`,
`paths`, `properties`, `responses`, `sort`, `tags`, `utilities`, renamed `.js` →
`.cjs`, with every `require('../lib/x')` changed to `require('./x.cjs')`.

## Not copied

- `index.js`: the Hapi plugin and UI routes (handlebars, swagger-ui-dist, inert, vision)
- `validate.js`: `swagger-parser`, used only to log validation output when `debug` is set

## Local edits

- `builder.cjs`:
  - `getSwaggerJSON(settings, request)` → `getSwaggerJSON(settings, routes)`, taking
    `server.table()` directly. With no request, the `?tags=` query filter and the
    request-derived fallbacks for `host`, `schemes` and `servers` (with their
    `getProxyHeader`/`getHost`/`getServerUrl`/`getSchema` helpers) are removed;
    `generateOpenApi` requires those options instead.
  - the `debug` → `Validate.log` call is removed.
  - `@apidevtools/json-schema-ref-parser` → `./dereference.cjs`.
  - the "failed to dereference schema" error keeps the underlying error as `cause`.
- `responses.cjs`: `http-status` → `./status-text.cjs`.
- `defaults.cjs`: the `templates` path (and its `path` import) is removed.

## Added

- `dereference.cjs` replaces `@apidevtools/json-schema-ref-parser` 11.x for the
  plain local `{ $ref }` objects hapi-swagger generates, and throws on anything
  else. See its header comment.
- `status-text.cjs` replaces `http-status` 1.8.1: its numeric status code → reason
  phrase entries, generated from that package.

`@hapi/hoek` and `joi` are the only external dependencies left. As with
hapi-swagger, routes must be built with the same `joi` version this package
resolves, or Joi throws "Cannot mix different versions of joi schemas".
