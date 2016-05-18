var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: [
    'webpack-hot-middleware/client',
    './src/js/main',
    './src/scss/styles.scss'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('styles.css')
  ],
  module: {
    loaders: [
      // js
      {
        test: /\.js$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'src')
      },
      // Bundle + compile scss
      {
        test: /\.scss$/,
        include: path.join(__dirname, 'src'),
        loader: ExtractTextPlugin.extract('css!postcss-loader!sass')

        // loaders: ['css', 'postcss-loader', 'sass']
      }
    ]
  }
};
