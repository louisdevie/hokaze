import eslint from '@eslint/js'
import tsESLint from 'typescript-eslint'

export default tsESLint.config(
  eslint.configs.recommended,
  ...tsESLint.configs.strict,
  {
    ignores: ['**/gen/'],
  },
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/consistent-generic-constructors': ['error', 'type-annotation'],
      '@typescript-eslint/explicit-member-accessibility': 'error',
    },
  },
)
