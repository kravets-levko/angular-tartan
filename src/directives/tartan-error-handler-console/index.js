'use strict';

var angular = require('angular');
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
        if (angular.isObject(console)) {
          def = angular.isFunction(console.trace) ? 'trace' : 'log';
          if (angular.isFunction(console.error)) {
            map.error = 'error';
          }
          if (angular.isFunction(console.warn)) {
            map.warning = 'warn';
          }
          if (angular.isFunction(console.info)) {
            map.notice = 'info';
          }
        }

        function errorHandler(error, data, severity) {
          var method = map[severity] || def;
          if (method) {
            console[method](error);
          }
        }

        controller.setErrorHandler(errorHandler);

        $scope.$on('$destroy', function() {
          if (controller.getErrorHandler === errorHandler) {
            controller.setErrorHandler(null);
          }
        });
      }
    };
  }
]);
