import image from '@rollup/plugin-image';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import url from '@rollup/plugin-url';

import { readFileSync } from 'fs';
const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);

const timestamp = new Date().toISOString();

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/loader-v6.js',
    format: 'esm',
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
    replace({
      preventAssignment: true,
      __BUILD_VERSION__: JSON.stringify(version),
      __BUILD_TIMESTAMP__: JSON.stringify(timestamp),
    }),
    url({
      destDir: 'dist',
      fileName: '[dirname][hash][extname]',
      include: ['**/*.mp3'],
      limit: 0,
      publicPath: '/local/community/dash-loader/',
    }),
  ],
};
