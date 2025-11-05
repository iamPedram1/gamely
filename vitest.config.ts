import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import os from 'os';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    watch: true,
    globals: true,
    hideSkippedTests: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/core/utilities/vitest.setup.ts'],
    pool: 'threads', // or 'forks' if you need full isolation
    maxWorkers: Math.max(1, Math.floor(os.cpus().length / 2)), // use half cores
    maxConcurrency: 5,
  },
});
