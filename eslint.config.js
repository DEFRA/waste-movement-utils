import neostandard from 'neostandard'

export default [
  // near-literal copy of hapi-swagger, kept in its upstream style
  { ignores: ['src/openapi/vendor/**'] },
  ...neostandard({
    env: ['node', 'jest'],
    ignores: [...neostandard.resolveIgnoresFromGitignore()],
    noJsx: true,
    noStyle: true
  }),
  {
    rules: {
      // neostandard's settings (ESLint replaces rule options wholesale, so they
      // are repeated here), plus allowing `_` for skipped array items
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'none',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
          destructuredArrayIgnorePattern: '^_'
        }
      ]
    }
  }
]
