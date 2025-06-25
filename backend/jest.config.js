module.exports = {
  // Remove or comment out rootDir:
  // rootDir: 'src',

  // Tell Jest where your source files live:
  roots: ['<rootDir>/src'],

  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true,
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
};
