import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/widget.js',
  output: {
    file: 'dist/chatbot.js',
    format: 'iife',
    name: 'ChatbotWidget',
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    postcss({
      inject: true,
      minimize: true
    }),
    terser({
      compress: {
        drop_console: false  // Keep error messages
      }
    })
  ]
};
