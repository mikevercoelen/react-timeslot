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
    rules: [
      {
        test: /\.js/,
        loader: 'babel-loader',
        include: paths.srcPath
      },
      {
        test: /\.scss$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'sass-loader'
        }]
      },
      {
        test: /\.css$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }]
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)(\?.*)?$/,
        loader: 'file-loader',
        query: {
          name: '[path][name].[ext]?[hash:8]'
        }
      }
    ]
  }
}
