import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

export default {
  input: "src/panel.ts", // Your entry point
  output: {
    file: "dist/panel.js", // Output file
    format: "es", // ES module (needed for Home Assistant)
    sourcemap: true, // Enable debugging
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
