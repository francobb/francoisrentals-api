const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    '<rootDir>/src/*.ts',
    '<rootDir>/src/controllers/*.ts',
    '<rootDir>/src/exceptions/*.ts',
    '<rootDir>/src/search/*.ts',
    '<rootDir>/src/services/*.ts',
    '<rootDir>/src/utils/*.ts',
    '!<rootDir>/node_modules/**',
    '!<rootDir>/src/config/**.ts',
    '!<rootDir>/src/databases/**.ts',
    '!<rootDir>/src/dtos/**.ts',
    '!<rootDir>/src/interfaces/**.ts',
    '!<rootDir>/src/models/**.ts',
  ],
  globalSetup: '<rootDir>/src/intTests/setup/globalSetup.ts',
  globalTeardown: '<rootDir>/src/intTests/setup/globalTeardown.ts',
  setupFilesAfterEnv: ['<rootDir>/src/intTests/setup/setupFile.ts'],
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src' }),
};
