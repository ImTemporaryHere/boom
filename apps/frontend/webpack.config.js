const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { join } = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/frontend'),
    clean: true,
  },
  watchOptions: {
    poll: 1000, // Check for changes every second
    aggregateTimeout: 300,
    ignored: /node_modules/,
  },
  devServer: {
    port: 4200,
    hot: true,
    liveReload: true,
    watchFiles: {
      paths: ['src/**/*', 'apps/frontend/src/**/*'],
      options: {
        usePolling: true,
        interval: 1000,
      },
    },
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      progress: true,
      webSocketURL: {
        hostname: '0.0.0.0',
        port: 4200,
      },
    },
  },
  plugins: [
    new NxAppWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/main.tsx',
      index: './src/index.html',
      baseHref: '/',
      assets: ['./src/favicon.ico', './src/assets'],
      styles: ['./src/styles.css'],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production',
    }),
    new NxReactWebpackPlugin({
      // Uncomment this line if you don't want to use SVGR
      // See: https://react-svgr.com/
      // svgr: false
    }),
    ...(isDevelopment ? [new ReactRefreshWebpackPlugin()] : []),
  ],
};
