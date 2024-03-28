export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@module/(.*)': '<rootDir>/src/$1',
    '@module': '<rootDir>/src/index',
    '@fake': '<rootDir>/test/_fake/index',
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
}
