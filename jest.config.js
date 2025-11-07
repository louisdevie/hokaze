export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  setupFilesAfterEnv: ['jest-extended/all'],
  collectCoverageFrom: ['lib/**/*.ts'],
  coverageReporters: ['html'],
  coverageDirectory: 'coverage',
}
