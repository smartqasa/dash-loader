import image from "@rollup/plugin-image";
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
    image(),
    resolve(),
    json(),
    typescript({
      experimentalDecorators: true,
      emitDecoratorMetadata: false,
    }),
  ],
};
