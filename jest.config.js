export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/__tests__/**/*.test.js', '**/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/node_modules/**',
    '!bin/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  setupFilesAfterEnv: ['<rootDir>/test.setup.js'],
  testTimeout: 30000,
  verbose: true,
  transformIgnorePatterns: [
    'node_modules/(?!(@modelcontextprotocol)/)'
  ]
};