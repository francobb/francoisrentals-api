const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: '<rootDir>/src/intTests/setup/globalSetup.ts',
  globalTeardown: '<rootDir>/src//intTests/setup/globalTeardown.ts',
  setupFilesAfterEnv: ['<rootDir>//intTests/setup/setupFile.ts'],
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src' }),
};
