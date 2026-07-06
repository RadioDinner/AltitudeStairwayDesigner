import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // mirror the tsconfig "@/*" -> repo-root path alias so tests import like the app
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["lib/**/*.test.ts", "components/**/*.test.ts"],
  },
});
