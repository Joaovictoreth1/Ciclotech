import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const [globalRules] = readFileSync(
  new URL("./public/_headers", import.meta.url),
  "utf8",
).split("\n\n");
const headers = Object.fromEntries(
  globalRules
    .split("\n")
    .slice(1)
    .map((rule) => {
      const separator = rule.indexOf(":");
      return [
        rule.slice(0, separator).trim(),
        rule.slice(separator + 1).trim(),
      ];
    }),
);

export default defineConfig({ preview: { headers } });
