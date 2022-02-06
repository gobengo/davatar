const { dependencies } = require("../package.json");
const { inspect } = require('util');
const builtins = require('builtin-modules');
const {default: resolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const analyze = require('rollup-plugin-analyzer')
const inject = require('@rollup/plugin-inject');
const path = require('path');
const { viteCommonjs } = require('@originjs/vite-plugin-commonjs');
const rollupNodePolyFill = require('rollup-plugin-node-polyfills');
const {
  NodeModulesPolyfillPlugin,
} = require("@esbuild-plugins/node-modules-polyfill");
const {
  NodeGlobalsPolyfillPlugin,
} = require("@esbuild-plugins/node-globals-polyfill");

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
    config.plugins = [
      rollupCleanStrictViolations(),
      resolve({ preferBuiltins: false }),

      viteCommonjs(),

      // rollupNodePolyFill(),
      ...config.plugins,
      inject({
        modules: {
          Buffer: ['buffer', 'Buffer']
        },
      }),
    ];
    config.build = {
      ...config.build,
      target: 'es2020',
      rollupOptions: {
        ...config.build?.rollupOptions,
        plugins: [
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
      esBuildOptions: {
        ...config.optimizeDeps?.esBuildOptions,
        plugins: [
          ...(config.optimizeDeps?.esBuildOptions?.plugins || []),
          NodeModulesPolyfillPlugin(),
          NodeGlobalsPolyfillPlugin({
            buffer: true,
          }),
        ],
      },
      exclude: [
        ...(config?.optimizeDeps?.exclude || []),
      ],
    }
    config.resolve.alias.buffer = require.resolve("buffer-es6");
    config.resolve.alias.stream = require.resolve("stream-browserify");
    config.resolve.alias.http = require.resolve('stream-http');
    config.resolve.alias.mortice = require.resolve('mortice/lib/browser');
    config.resolve.alias.url = require.resolve('rollup-plugin-node-polyfills/polyfills/url');
    // config.resolve.alias.util = require.resolve('rollup-plugin-node-polyfills/polyfills/util');
    config.resolve.alias.os = require.resolve("os-browserify/browser");
    config.resolve.alias.https = require.resolve("https-browserify");
    console.log('vite config', inspect(config, false, Infinity));
    return config;
  }
}

function rollupCleanStrictViolations() {
  return {
    name: "clean-strict-violations",
    transform(code, id) {
      if (id.indexOf("libp2p.js") >= 0) {
        // these are here due to libp2p -> nat-api -> xml2js (old version)
        // the bundled xml2js@^1 is complied form coffeescript and has this error
        // because vite transpiles to ESM which *have to be* 'use strict'.
        // https://github.com/jashkenas/coffeescript/issues/2052
        // TODO: upgrade libp2p/nat-api to not use super old xml2js
        code = code.replace('ValidationError.name = "ValidationError";', "");
        code = code.replace('Parser.name = "Parser";', "");
      }
      return {
        map: null,
        code,
      };
    },
  };
}
