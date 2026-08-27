export default {
  testRunner: 'jest',
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  mutate: ['src/**/*.ts', '!src/main.ts', '!src/**/*.module.ts', '!src/application/ports/**/*.ts'],
  reporters: ['clear-text', 'progress', 'html', 'json'],
  coverageAnalysis: 'perTest',
  thresholds: { high: 91, low: 85, break: 80 },
  tempDirName: '.stryker-tmp',
};
