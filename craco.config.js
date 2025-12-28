const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = Object.assign({}, webpackConfig.resolve.fallback || {}, {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        assert: require.resolve('assert/'),
        vm: require.resolve('vm-browserify')
      });

      webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias || {}, {
        'process/browser': require.resolve('process/browser'),
        'process/browser.js': require.resolve('process/browser.js'),
        process: require.resolve('process/browser')
      });

      webpackConfig.plugins = webpackConfig.plugins || [];
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      return webpackConfig;
    }
  }
};
