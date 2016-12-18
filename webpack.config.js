/* eslint-env node */
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const GenerateAssetPlugin = require('generate-asset-webpack-plugin');
const generateAudioMap = require('./build/generate-audio-map');
const generateTextureMap = require('./build/generate-texture-map');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const sharedConfig = require('./src/node_modules/shared/config');
const webpack = require('webpack');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = !IS_PRODUCTION;
const ROOT = __dirname;
const INCLUDE_PATHS = [path.resolve(ROOT, 'src')];
const EXCLUDE_PATHS = [path.resolve(ROOT, 'node_modules')];
const ENTRY_POINT = path.join(ROOT, 'src/node_modules/game');
const OUTPUT_PATH = path.join(ROOT, 'dist');
const PUBLIC_PATH = '';
const AUDIO_PATH = sharedConfig.audioPath;
const TEXTURE_PATH = sharedConfig.texturePath;

let cssLoader;
if (IS_PRODUCTION) {
  cssLoader = ExtractTextPlugin.extract({
    fallbackLoader: 'style-loader',
    loader: 'css-loader?minimize',
  });
} else {
  cssLoader = 'style-loader!css-loader';
}

const config = {
  context: ROOT,
  entry: ['babel-polyfill', ENTRY_POINT],
  output: {
    path: OUTPUT_PATH,
    publicPath: PUBLIC_PATH,
    filename: 'main.js',
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: ROOT,
      verbose: false,
    }),
    new CopyWebpackPlugin([
      { from: 'res/snd', to: AUDIO_PATH },
      { from: 'res/tex', to: TEXTURE_PATH },
    ], { ignore: ['.*'] }),
    new GenerateAssetPlugin({
      filename: sharedConfig.textureMap,
      fn: (_compilation, cb) => {
        const dir = path.join(ROOT, 'res/tex');
        generateTextureMap(dir)
          .then((map) => cb(null, map))
          .catch((err) => cb(err, null));
      },
    }),
    new GenerateAssetPlugin({
      filename: sharedConfig.audioMap,
      fn: (_compilation, cb) => {
        const dir = path.join(ROOT, 'res/snd');
        generateAudioMap(dir)
          .then((map) => cb(null, map))
          .catch((err) => cb(err, null));
      },
    }),
    new webpack.optimize.OccurrenceOrderPlugin(false),
    new HtmlWebpackPlugin({
      title: 'PIXI/Webpack Starter Kit',
      cache: false,
      minify: { collapseWhitespace: true },
      hash: true,
    }),
  ],
  module: {
    rules: [
      { test: /\.css$/, loader: cssLoader, include: INCLUDE_PATHS },
      { test: /\.js$/, loader: 'babel-loader', include: INCLUDE_PATHS },
    ],
  },
  devServer: {
    historyApiFallback: false,
    noInfo: true,
  },
  devtool: IS_DEVELOPMENT ? '#eval-source-map' : '#source-map',
};

if (IS_PRODUCTION) {
  const prodPlugins = [
    new webpack.optimize.UglifyJsPlugin({
      comments: () => false,
      sourceMap: true,
      compress: {
        warnings: false,
      },
    }),
    new ExtractTextPlugin('style.css'),
  ];
  config.plugins = config.plugins.concat(prodPlugins);
} else if (IS_DEVELOPMENT) {
  const devPlugins = [
    new webpack.LoaderOptionsPlugin({
      options: {
        eslint: {
          fix: true,
        },
      },
    }),
    new webpack.NamedModulesPlugin(),
  ];
  config.plugins = config.plugins.concat(devPlugins);
  config.module.rules.unshift({
    test: /\.js$/,
    loader: 'eslint-loader',
    enforce: 'pre',
    include: [ROOT],
    exclude: EXCLUDE_PATHS,
  });
}

module.exports = config;
