# Waste Movement Reference Data

Reference data for the Waste Movement services. It holds the EWC, HP, POP, container and disposal or recovery codes, the regexes and their lookup helpers, and the value lists the receipt rules share, such as means of transport. It has no dependencies.

## Installation

```bash
npm install @defra/waste-movement-reference-data
```

The package is ESM only. A service whose Jest config lists the packages to transform adds this name to that list. A service whose `.npmrc` sets `min-release-age` adds `min-release-age-exclude[]=@defra/waste-movement-reference-data` to take a version younger than that age.

## Development

This package lives in [waste-movement-utils](https://github.com/DEFRA/waste-movement-utils) under `packages/reference-data`. It is tested with that repository's own commands, which the README there lists.

`@defra/waste-movement-utils` does not depend on this package yet, so each file under `src/constants` is a copy of the library's file of the same name. Change both in the same pull request. A test fails when they differ.

A pull request that changes this package gives it a new version in its `package.json`. The merge publishes that version, provided the name is already on npm. A Defra npm org admin publishes a new name the first time and sets its trusted publisher.

## Licence

Open Government Licence v3. The [repository README](https://github.com/DEFRA/waste-movement-utils#licence) has the licence statement and the attribution to cite.
