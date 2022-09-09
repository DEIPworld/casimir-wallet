/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  "root": true,
  "extends": [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript/recommended",

    // "@casimir.one/eslint-config",
    // "@casimir.one/eslint-config/vue"
  ],
  "env": {
    "vue/setup-compiler-macros": true
  },

  rules: {
    'object-curly-spacing': ["error", "always"],
    'array-bracket-spacing': ['error', 'never'],
    'block-spacing': ['error', 'always'],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    camelcase: ['error', { properties: 'never', ignoreDestructuring: false }],
    "comma-dangle": ["error", "never"],
    radix: ['error', 'as-needed'],
    'max-len': [
      'error',
      {
        code: 100,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ],
    semi: ['error', 'always']
  }
};
