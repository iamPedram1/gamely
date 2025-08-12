import { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  watchAll: true,
  testEnvironment: 'node',
  moduleNameMapper: {
    '^app$': '<rootDir>/src/app',
    '^api/(.*)$': '<rootDir>/src/api/$1',
    '^middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^dto/(.*)$': '<rootDir>/src/dto/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^startup/(.*)$': '<rootDir>/src/startup/$1',
    '^utilites/(.*)$': '<rootDir>/src/utilites/$1',
  },
};

export default config;
