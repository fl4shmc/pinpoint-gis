import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/test/styleMock.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverage: true,
  coverageDirectory: "coverage",
};

export default config;
