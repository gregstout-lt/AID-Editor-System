// @ts-check
import globals from 'globals';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

export default tseslint.config([
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'prefer-promise-reject-errors': 'error',
      'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
      'space-before-blocks': ['error', 'always']
    }
  },
  {
    files: ['**/*.js'],
    ignores: ['src/browser.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
				...globals.es2024,
				...globals.node
			}
    }
  },
  {
    files: ['src/browser.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
				...globals.es2024,
				...globals.browser
			}
    }
  }
]);
