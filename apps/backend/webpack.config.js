const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');
const { join } = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/backend'),
    clean: true,
    ...(isDevelopment && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  watchOptions: isDevelopment ? {
    poll: 1000, // Check for changes every second (required for Docker volumes)
    aggregateTimeout: 300,
    ignored: /node_modules/,
  } : undefined,
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
    }),
    ...(isDevelopment ? [
      new NodemonPlugin({
        script: '../../dist/apps/backend/main.js',
        watch: '../../dist/apps/backend',
        ext: 'js',
        legacyWatch: true, // Use polling for Docker volumes
        delay: 2000,
      })
    ] : []),
  ],
};
