'use strict';

var module = require('../../module');

module.directive('tartanErrorHandlerCollect', [
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

        controller.setErrorHandler(function(error, data, severity) {
          if (error instanceof Error) {
            error.data = data;
            error.severity = severity;
          }
          temp.push(error);
        });

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
      }
    };
  }
]);
