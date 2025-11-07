import baseOptions from '../../jest.config.js'

export default {
  ...baseOptions,
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/lib/$1',
    __mocks__: '<rootDir>/test/__mocks__',
  },
}
