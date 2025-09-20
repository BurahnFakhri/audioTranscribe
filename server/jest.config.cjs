module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30_000,
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverage: false
};
