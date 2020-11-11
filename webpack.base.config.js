const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const { DefinePlugin } = require('webpack');
const { getIfUtils } = require('webpack-config-utils');
const TerserPlugin = require('terser-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';
const { ifProduction } = getIfUtils(NODE_ENV);
const UI_ROOT = path.resolve(__dirname, 'ui/');
const STATIC_ROOT = path.resolve(__dirname, 'static/');

let baseConfig = {
  mode: ifProduction('production', 'development'),
  devtool: ifProduction('source-map', 'eval-cheap-module-source-map'),
  node: {
    __dirname: false,
  },
  devServer: {
    historyApiFallback: true,
    writeToDisk: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        // exclude: /node_modules/,
        use: [
          { loader: 'cache-loader' },
          { loader: 'thread-loader' },
          {
            loader: 'babel-loader',
            options: {
              compact: true,
              presets: ['@babel/env', '@babel/react', '@babel/flow'],
              plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-proposal-class-properties'],
            },
          },
        ],
      },
      {
        test: /\.s?css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              plugins: function() {
                return [require('postcss-rtl')()];
              },
            },
          },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.(png|svg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'img/',
            name: '[name].[ext]',
          },
        },
      },
      {
        test: /\.(vert|frag|glsl)$/,
        use: {
          loader: 'raw-loader',
        },
      },
    ],
  },
  // Allows imports for all directories inside '/ui'
  resolve: {
    modules: [UI_ROOT, 'node_modules', __dirname],
    extensions: ['.js', '.jsx', '.json', '.scss'],
    alias: {
      config: path.resolve(__dirname, 'config.js'),
      homepage: 'util/homepage.js',
      homepages:
        process.env.CUSTOM_HOMEPAGE === 'true'
          ? path.resolve(__dirname, 'custom/homepages/index.js')
          : 'homepages/index.js',
      lbryinc: 'lbryinc/dist/bundle.es.js',
      // Build optimizations for 'redux-persist-transform-filter'
      'redux-persist-transform-filter': 'redux-persist-transform-filter/index.js',
      'lodash.get': 'lodash-es/get',
      'lodash.set': 'lodash-es/set',
      'lodash.unset': 'lodash-es/unset',
      'lodash.pickby': 'lodash-es/pickBy',
      'lodash.isempty': 'lodash-es/isEmpty',
      'lodash.forin': 'lodash-es/forIn',
      'lodash.clonedeep': 'lodash-es/cloneDeep',
      ...ifProduction({}, { 'react-dom': '@hot-loader/react-dom' }),
    },
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
    },
    symlinks: false,
  },

  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new DefinePlugin({
      __static: `"${path.join(__dirname, 'static').replace(/\\/g, '\\\\')}"`,
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'process.env.LBRY_API_URL': JSON.stringify(process.env.LBRY_API_URL),
      'process.env.SENTRY_AUTH_TOKEN': JSON.stringify(process.env.SENTRY_AUTH_TOKEN),
      'process.env.MOONPAY_SECRET_KEY': JSON.stringify(process.env.MOONPAY_SECRET_KEY),
    }),
    new Dotenv({
      allowEmptyValues: true, // allow empty variables (e.g. `FOO=`) (treat it as empty string, rather than missing)
      systemvars: true, // load all the predefined 'process.env' variables which will trump anything local per dotenv specs.
      silent: false, // hide any errors
      defaults: true, // load '.env.defaults' as the default values if empty.
    }),
  ],
};

if (NODE_ENV === 'production') {
  baseConfig.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
      }),
    ],
  };
}

module.exports = baseConfig;
