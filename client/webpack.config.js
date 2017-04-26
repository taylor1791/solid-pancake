const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    app: './src/index',
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isProd ? "[name].[id].[hash].js" : "[name].js",
    // publicPath: '/assets/',
  },

  module: {
    rules: [],
  },

  plugins: [
    new HtmlWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.optimize.UglifyJsPlugin({
      // beautify: true,
      sourcemap: true,
    }),
  ],

  devtool: isProd ? 'source-map' : 'eval',
  target: 'web',
  //devServer: {}
  profile: !isProd,
  node: {},

  devServer: {
    inline: true,
  },
};
