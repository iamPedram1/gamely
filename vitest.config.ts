import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    pool: 'threads',
    maxWorkers: 1,
    isolate: true,
    sequence: { concurrent: false },
    globals: true,
    environment: 'node',
    silent: 'passed-only',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/core/utilities/vitest.setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
