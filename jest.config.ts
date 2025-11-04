import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },

  extensionsToTreatAsEsm: ['.ts'],

  moduleNameMapper: {
    '^app$': '<rootDir>/src/app.ts',
    '^core/(.*)$': '<rootDir>/src/core/$1',
    '^features/(.*)$': '<rootDir>/src/features/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // ✅ modern Jest setup — remove deprecated globals
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
};

export default config;
