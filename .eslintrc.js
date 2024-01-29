module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'simple-import-sort', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/prettier',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  ignorePatterns: [
    '.eslintrc.js',
    'dist',
    'node_modules',
    'rust-wasm',
    'scripts',
    'prettier.config.js',
  ],
  rules: {
    'comma-spacing': ['error', { before: false, after: true }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'prettier/prettier': 'error',
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
        },
        groups: ['object', ['builtin', 'external'], 'parent', 'sibling', 'index', 'type'],
        'newlines-between': 'always',
      },
    ],
  },
  parserOptions: {
    extraFileExtensions: ['.json'],
    sourceType: 'module',
    project: './tsconfig.json',
  },
}
