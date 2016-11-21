'use strict';

var ngTartan = require('../../module');

ngTartan.directive('tartanErrorHandlerThrow', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '',
      replace: false,
      scope: {},
      link: function($scope, element, attr, controller) {
        function errorHandler(error, data, severity) {
          if (error instanceof Error) {
            error.data = data;
            error.severity = severity;
          }
          throw error;
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
