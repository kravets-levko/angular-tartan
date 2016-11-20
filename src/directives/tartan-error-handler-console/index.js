'use strict';

var _ = require('lodash');
var ngTartan = require('../../module');

ngTartan.directive('tartanErrorHandlerConsole', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '',
      replace: false,
      scope: {},
      link: function($scope, element, attr, controller) {
        var map = {};
        var def = null;
        if (_.isObject(console)) {
          def = _.isFunction(console.trace) ? 'trace' : 'log';
          if (_.isFunction(console.error)) {
            map.error = 'error';
          }
          if (_.isFunction(console.warn)) {
            map.warning = 'warn';
          }
          if (_.isFunction(console.info)) {
            map.notice = 'info';
          }
        }

        controller.setErrorHandler(function(error, data, severity) {
          var method = map[severity] || def;
          if (method) {
            console[method](error);
          }
        });
      }
    };
  }
]);
