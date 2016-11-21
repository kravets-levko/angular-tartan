'use strict';

var ngTartan = require('../../module');

ngTartan.directive('tartanErrorHandlerCollect', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '',
      replace: false,
      scope: {
        model: '=?'
      },
      link: function($scope, element, attr, controller) {
        var temp = [];

        function errorHandler(error, data, severity) {
          if (error instanceof Error) {
            error.data = data;
            error.severity = severity;
          }
          temp.push(error);
        }

        controller.setErrorHandler(errorHandler);

        controller.on('tartan.beginUpdate', function() {
          temp = [];
          $scope.model = temp;
          $scope.$applyAsync();
        });
        controller.on('tartan.endUpdate', function() {
          $scope.model = temp;
          temp = [];
          $scope.$applyAsync();
        });

        $scope.$on('$destroy', function() {
          if (controller.getErrorHandler === errorHandler) {
            controller.setErrorHandler(null);
          }
        });
      }
    };
  }
]);
