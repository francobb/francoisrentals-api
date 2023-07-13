const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: '<rootDir>/intTests/setup/globalSetup.ts',
  globalTeardown: '<rootDir>/intTests/setup/globalTeardown.ts',
  setupFilesAfterEnv: ['<rootDir>/intTests/setup/setupFile.ts'],
  roots: ['<rootDir>/intTests'],
  testPathIgnorePatterns: ['<rootDir>/test'],
  transformIgnorePatterns: ['/node_modules/(?!(axios)/).*'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src' }),
};
