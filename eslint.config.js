import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  {
    files: ["**/*.js"],
    rules: {
      curly: ["error", "multi-line"],
      eqeqeq: "error",
      "no-constant-condition": "error",
      "no-debugger": "error",
      "no-dupe-keys": "error",
      "no-fallthrough": "error",
      "no-implicit-coercion": ["error", { boolean: false }],
      "no-redeclare": "error",
      "no-undef": "error",
      "no-unreachable": "error",
      "no-unused-vars": ["error", { args: "all" }],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  {
    files: ["src/**/*.js"],
    languageOptions: { globals: globals.browser },
    rules: { "no-console": "error" },
  },
  {
    files: ["*.config.js", "tests/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
