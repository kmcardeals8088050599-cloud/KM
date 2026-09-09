import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['server/**/*.test.ts'],
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      '@': process.cwd(),
    },
  },
});