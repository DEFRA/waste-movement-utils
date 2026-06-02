# Waste Movement Utils

Collection of shared components and utils for use in Waste Movement Services.

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

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
