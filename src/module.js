'use strict';

var tartan = require('tartan');
var angular = require('angular');

var ngTartan = angular.module('angular-tartan', []);

ngTartan.constant('tartan', tartan);

module.exports = ngTartan;
