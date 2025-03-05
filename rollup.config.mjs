import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    resolve(), // Resolves node_modules dependencies
    json(), // Allows importing JSON files
    typescript({
      experimentalDecorators: true, // Enable decorators
      emitDecoratorMetadata: false, // Prevent TypeScript 5+ issues
    }),
  ],
};
