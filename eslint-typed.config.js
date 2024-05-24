import tsESLint from 'typescript-eslint'
import baseCfg from './eslint.config.js'

export default tsESLint.config(
  ...baseCfg,
  ...tsESLint.configs.strictTypeCheckedOnly,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowBoolean: true,
          allowNumber: true,
        },
      ],
    },
  },
)
