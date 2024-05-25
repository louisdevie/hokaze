export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@module/(.*)': '<rootDir>/src/$1',
    '@module': '<rootDir>/src/index',
    '@fake': '<rootDir>/test/_fake/index',
    '@data': '<rootDir>/test/_data/constants',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  setupFilesAfterEnv: ['jest-extended/all'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['src/locale/gen/*'],
  coverageDirectory: '.',
  coverageReporters: [
    [
      'cobertura',
      {
        file: 'coverage.xml',
      },
    ],
  ],
}
