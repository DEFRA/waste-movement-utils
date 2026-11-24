# Waste Movement Utils

Collection of shared components and utils for use in Waste Movement Services.

## Packages

This repository publishes several packages. `@defra/waste-movement-utils` is the umbrella. It depends on the packages under `packages/` at exact versions and re-exports them, so a service that imports from it needs no code change. A service that wants less installs only the packages it uses.

| Package                                      | Folder                    | What it holds                                                                                                           | Dependencies              |
| -------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `@defra/waste-movement-utils`                | `.`                       | The umbrella. It also holds the Joi schemas, validation errors and warnings for Receipt of Waste, and the test fixtures | the packages below, `joi` |
| `@defra/waste-movement-utils-reference-data` | `packages/reference-data` | EWC, HP, POP, container and disposal or recovery codes, value lists, regexes and their lookup helpers                   | none                      |
| `@defra/waste-movement-utils-http-errors`    | `packages/http-errors`    | HTTP status codes, error types and the RFC 9457 problem-details error handler                                           | none                      |
| `@defra/waste-movement-utils-service`        | `packages/service`        | Basic-auth plugin, env-var helper, backoff options, metric names, audit types and logging helpers                       | `@hapi/basic`             |

A service whose `.npmrc` sets `min-release-age` and exempts `@defra/waste-movement-utils` needs a second line, `min-release-age-exclude[]=@defra/waste-movement-utils-*`. npm exempts the named package and not its dependencies, so without the line a move to a new release fails while any package version it brings is younger than that age.

The packages are npm workspaces. `npm install` at the root links them, and `npm test` runs the tests of every package.

## Prerequisites

- Node.js (see .nvmrc for required version, use [nvm](https://github.com/creationix/nvm) for version management)
- npm

## Getting Started

### Clone and Install

```bash
git clone git@github.com:DEFRA/waste-movement-utils.git
cd waste-movement-utils
nvm use
npm install
```

## Development

### Running Tests

Run unit tests:

```bash
npm test
```

### Code Quality

This project follows DEFRA code standards. Before committing:

- Code is automatically formatted with Prettier
- ESLint checks are run via Husky pre-commit hooks
- PRs must pass all tests and linting checks

To manually run code quality checks:

```bash
npm run lint           # Run ESLint
npm run format:check   # Check code formatting
```

To fix issues automatically:

```bash
npm run lint:fix       # Auto-fix linting issues
npm run format         # Format code with Prettier
```

### Releasing

A merge to `main` publishes every package whose version is not on npm yet, the packages first and the umbrella last.

- Every pull request gives the root `package.json` a new version.
- A change under `packages/<name>` gives that package a new version as well, and the same version goes wherever another `package.json` here depends on it.
- A new package needs a Defra npm org admin to publish it once before the pull request that adds it merges. Ask in #npm-support, as the Defra [shared libraries guide](https://defra.github.io/software-development-standards/guides/shared_libraries/) describes.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
