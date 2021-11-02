/* eslint-env node */

import {chrome} from '../../electron-vendors.config.json';
import {join} from 'path';
import react from '@vitejs/plugin-react';
import builtins from 'rollup-plugin-node-builtins';

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
    },
  },
  plugins: [
    react(),
  ],
  base: '',
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      plugins: [
        // nodePolyfills(),
        { ...builtins({ crypto: true }), name: 'rollup-plugin-node-builtins' },
      ],
    },
    emptyOutDir: true,
    brotliSize: false,
  },
};

export default config;
