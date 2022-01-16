import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import typescript from 'rollup-plugin-typescript';
import css from "rollup-plugin-import-css";
export default {
  input: "src/index.js",
  output: {
    file: "dist/bundle.js",
    format: "iife",
    sourcemap: true,
  },
  plugins: [
    css(),
    alias({
      entries: [
        // { find: /konva\/(.*)/, replacement: './node_modules/konva/$1.js' },
        // { find: "konva", replacement: './node_modules/konva/lib/index.js' }
        { find: /konva\/(.*)/, replacement: '../konva/$1.js' },
        { find: "konva", replacement: '../konva/lib/index.js' }
      ]
    }),
    nodeResolve({
      extensions: [".js", ".ts", ".jsx", ".tsx"],
    }),
    typescript(),
    replace({
      values: {
        'process.env.NODE_ENV': JSON.stringify( 'development' )
      },
      preventAssignment: true
    }),
    babel({
      presets: ["@babel/preset-react"],
    }),
    commonjs(),
    serve({
      open: true,
      verbose: true,
      contentBase: ["", "public"],
      host: "localhost",
      port: 3000,
    }),
    livereload({ watch: "dist" }),
  ]
};
