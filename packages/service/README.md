# Waste Movement Utils Service

Service plumbing for the Waste Movement services: the basic-auth plugin, the env-var helper, backoff options, metric names, audit types and the OpenSearch metrics logging helper. Its one dependency is `@hapi/basic`.

## Installation

```bash
npm install @defra/waste-movement-utils-service
```

`@defra/waste-movement-utils` re-exports everything in this package, so a service that installs that needs nothing more.

## Development

This package lives in [waste-movement-utils](https://github.com/DEFRA/waste-movement-utils) under `packages/service`. It is tested and released from the root of that repository, and the README there says how.

## Licence

Open Government Licence v3. The [repository README](https://github.com/DEFRA/waste-movement-utils#licence) has the licence statement and the attribution to cite.
