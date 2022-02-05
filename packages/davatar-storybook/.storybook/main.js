const { dependencies } = require("../package.json");
const { inspect } = require('util');
const builtins = require('builtin-modules');
const {default: resolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const analyze = require('rollup-plugin-analyzer')
const inject = require('@rollup/plugin-inject');
const path = require('path');
const { viteCommonjs } = require('@originjs/vite-plugin-commonjs');

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "storybook-builder-vite"
  },
  features: {
    storyStoreV7: true,
  },
  async viteFinal(config, { configType }) {
    config.build = {
      ...config.build,
      rollupOptions: {
        ...config.build?.rollupOptions,
        plugins: [
          resolve(),
          viteCommonjs(),
          ...config.build?.rollupOptions?.plugins || [],
        ],
        external: builtins,
        output: {
          ...config.build?.rollupOptions?.output,
        }
      }
    }
    config.optimizeDeps = {
      ...(config.optimizeDeps || {}),
      exclude: [
        ...(config?.optimizeDeps?.exclude || []),
      ]
    }
    config.resolve.alias.stream = require.resolve("stream-browserify");
    config.resolve.alias.http = require.resolve('stream-http');
    config.resolve.alias.url = require.resolve('rollup-plugin-node-polyfills/polyfills/url');
    console.log('vite config', inspect(config, false, Infinity));
    return config;
  }
}