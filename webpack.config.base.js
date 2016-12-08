'use strict';

var webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    library: 'angularTartan',
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  externals: {
    // require('angular') is external and available on the global var `angular`
    angular: 'angular',
    // same `tartan`
    tartan: 'tartan'
  },
  module: {
    loaders: [
      {test: /\.html$/, loader: 'raw'},
      {test: /\.json/, loader: 'json'},

      // Evaluate @package.js and bundle pre-calculated exports as a value.
      // This allows to omit package.json from bundle.
      {test: /[\\/]@package\.js$/, loaders: ['raw', 'val']}
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
};
