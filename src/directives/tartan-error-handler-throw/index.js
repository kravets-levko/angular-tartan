'use strict';

var module = require('../../module');

module.directive('tartanErrorHandlerThrow', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '',
      replace: false,
      scope: {},
      link: function($scope, element, attr, controller) {
        controller.setErrorHandler(function(error, data, severity) {
          if (error instanceof Error) {
            error.data = data;
            error.severity = severity;
          }
          throw error;
        });
      }
    };
  }
]);
