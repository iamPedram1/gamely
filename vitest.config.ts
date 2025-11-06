import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    watch: true,
    globals: true,
    hideSkippedTests: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/core/utilities/vitest.setup.ts'],
    maxWorkers: '100%',
    maxConcurrency: 5,
    testTimeout: 5000,
  },
});
