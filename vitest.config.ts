import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    watch: true,
    globals: true,
    hideSkippedTests: true,
    environment: 'node',
    dir: 'src/features',
    include: ['**/*.test.ts'],
    pool: 'threads',
    setupFiles: ['src/core/utilities/vitest.setup.ts'],
    maxWorkers: '100%',
    testTimeout: 5000,
  },
});
