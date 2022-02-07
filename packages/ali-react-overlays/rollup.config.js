import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

const external = Object.keys(pkg.dependencies).concat(Object.keys(pkg.peerDependencies), [
  'react-dom',
  'rxjs/operators',
  'prop-types',
]);

export default {
  input: 'src/index.tsx',
  output: {
    dir: 'dist-temp',
    format: 'esm',
    entryFileNames: 'ali-react-overlays.js',
  },
  plugins: [
    typescript({ tsconfig: 'tsconfig.json' }),
    resolve({
      extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
    }),
  ],
  external,
  treeshake: {
    moduleSideEffects: false,
  },
};
