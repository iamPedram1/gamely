export default {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^app$': '<rootDir>/src/app',
    '^api/(.*)$': '<rootDir>/src/api/$1',
    '^middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^startup/(.*)$': '<rootDir>/src/startup/$1',
    '^utilites/(.*)$': '<rootDir>/src/utilites/$1',
  },
};
