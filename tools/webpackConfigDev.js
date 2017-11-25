const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const env = require('./helpers/env')
const paths = require('./helpers/paths')

module.exports = {
  entry: {
    main: path.join(paths.srcPath, 'index.js')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(paths.srcPath, 'index.html'),
      inject: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(env.env)
      },
      __PROD__: env.isProd,
      __DEV__: env.isDev
    })
  ],
  output: {
    filename: '[name].js'
  },
  module: {
    rules: w
  }
}
