/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // CSS modules: a component under test imports one, and jest has no pipeline
    // for it. Resolves every class name to itself so a render assertion works.
    '\\.(css)$': '<rootDir>/tests/style-mock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '<rootDir>/**/*.test.(ts|tsx|js|jsx)',
    '<rootDir>/**/*.spec.(ts|tsx|js|jsx)',
  ],
  // Playwright specs live in e2e/ and run via `pnpm test:e2e` against a real
  // server. Jest's testMatch would otherwise sweep them up, where they fail to
  // load on Playwright's own runtime rather than on anything project-specific.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!(fast-check)/)'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/*.d.ts',
  ],
}
