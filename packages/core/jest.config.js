import baseConfig from "../../config/jest.config.js";

export default {
  ...baseConfig,
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/lib/$1",
    __mocks__: "<rootDir>/test/__mocks__",
  },
};
