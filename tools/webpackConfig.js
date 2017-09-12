const path = require('path')
const fs = require('fs')

const paths = require('./helpers/paths')

const srcComponentsFolder = path.join(paths.srcPath, 'components')
const components = fs.readdirSync(srcComponentsFolder)

const files = []
const entries = {}

components.forEach(component => {
  const name = component.split('.')[0]
  const file = `./src/components/${name}`
  files.push(file)
  entries[name] = file
})

module.exports = {
  entry: entries,
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../build/components/'),
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        loader: 'babel-loader',
        include: paths.srcPath
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
        test: /\.(ttf|eot|woff|woff2)(\?.*)?$/,
        loader: 'file-loader',
        query: {
          name: '[hash:8].[ext]'
        }
      }
    ]
  }
}
