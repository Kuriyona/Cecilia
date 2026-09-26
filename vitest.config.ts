import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // `**/*.live.test.ts` 要求 `.live.` 前有路径段，匹配不到 test/live.test.ts，必须显式排除。
    exclude: [
      ...configDefaults.exclude,
      "**/*.live.test.ts",
      "test/live.test.ts",
      "api-enhanced/**",
    ],
  },
});
