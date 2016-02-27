import babel from 'rollup-plugin-babel';

export default {
  entry: 'selector-set.global.js',
  dest: 'dist/selector-set.global.js',
  format: 'iife',
  plugins: [ babel() ]
};
