module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    "no-undef": "off",
    "@typescript-eslint/no-undef": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "varsIgnorePattern": "^_",
      "argsIgnorePattern": "^_",
      "ignoreRestSiblings": true,
      "vars": "all",
      "args": "after-used",
      "ignoreRestSiblings": true,
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_|^type"
    }]
  }
}