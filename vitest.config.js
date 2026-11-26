import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.js"],
    coverage: {
      provider: "v8",
      include: ["src/ledger.js"],
      reporter: ["text", "html"],
      thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 },
    },
  },
});
