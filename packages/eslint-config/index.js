/**
 * @purdia/eslint-config
 *
 * Shared ESLint flat config for Vue 3 + TypeScript projects.
 *
 * Usage in your eslint.config.js:
 *
 *   import purdiaConfig from '@purdia/eslint-config'
 *   export default [...purdiaConfig]
 */

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vuePlugin from 'eslint-plugin-vue'

export default [
  // Base JS recommended
  js.configs.recommended,

  // TypeScript recommended (type-aware disabled for perf — enable per-project if needed)
  ...tseslint.configs.recommended,

  // Vue essential rules
  ...vuePlugin.configs['flat/recommended'],

  // Purdia overrides
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // Vue
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': [
        'error',
        { html: { void: 'always', normal: 'always', component: 'always' } },
      ],

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Ignore patterns
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.d.ts'],
  },
]
