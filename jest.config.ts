const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    '<rootDir>/src/app.ts',
    '<rootDir>/src/server.ts',
    '<rootDir>/src/controllers/**.ts',
    '<rootDir>/src/exceptions/*.ts',
    '<rootDir>/src/services/**.ts',
    '<rootDir>/src/utils/*.ts',
    '!<rootDir>/node_modules/**',
    '!<rootDir>/src/config/**.ts',
    '!<rootDir>/src/databases/**.ts',
    '!<rootDir>/src/dtos/**.ts',
    '!<rootDir>/src/interfaces/**.ts',
    '!<rootDir>/src/models/**.ts',
    '!<rootDir>/src/search/transactions.search.ts',
    '!<rootDir>/src/services/clients/twilio.client.ts',
    '!<rootDir>/src/utils/frAscii.ts',
    '!<rootDir>/src/utils/logger.ts',
    '!<rootDir>/src/utils/validateEnv.ts',
  ],
  roots: ['<rootDir>/tests/unit'],
  testPathIgnorePatterns: ['<rootDir>/src/tests/integration'],
  transformIgnorePatterns: ['/node_modules/(?!(axios)/).*'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src' }),
};
