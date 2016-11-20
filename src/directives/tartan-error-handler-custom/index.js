'use strict';

var ngTartan = require('../../module');

ngTartan.directive('tartanErrorHandlerCustom', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '',
      replace: false,
      scope: {
        handler: '=?'
      },
      link: function($scope, element, attr, controller) {
        $scope.$watch('handler', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            controller.setErrorHandler($scope.handler);
          }
        });
        controller.setErrorHandler($scope.handler);
      }
    };
  }
]);
