module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testRegex: '.*\\.(spec|test|e2e-spec)\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/**/*.module.ts'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['/dist/']
};