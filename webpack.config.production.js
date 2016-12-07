'use strict';

var _ = require('lodash');
var webpack = require('webpack');
var baseConfig = require('./webpack.config.base');

var productionConfig = {
  output: {
    filename: 'angular-tartan.min.js',
    path: './dist'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        /* eslint-disable camelcase */
        screw_ie8: true,
        /* eslint-enable camelcase */
        warnings: false
      }
    })
  ]
};

var config = _.merge({}, baseConfig, productionConfig);

module.exports = config;
