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
  async viteFinal(config, { configType }) {
    config.resolve.alias.stream = require.resolve("stream-browserify");
    config.resolve.alias.http = require.resolve('stream-http');
    config.resolve.alias.url = require.resolve('rollup-plugin-node-polyfills/polyfills/url');
    config.build = {
      ...config.build,
      rollupOptions: {
        ...config.build?.rollupOptions,
        plugins: [
          ...config.build?.rollupOptions?.plugins || [],
          require('rollup-plugin-node-polyfills')(),
        ]
      }
    }
    return config;
  }
}