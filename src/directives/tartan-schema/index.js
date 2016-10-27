'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var module = require('../../module');

module.directive('tartanSchema', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '',
      replace: false,
      scope: {
        name: '@',
        options: '=?'
      },
      link: function($scope, element, attr, controller) {
        function update(preset) {
          var parse = null;
          var format = null;
          if (_.isObject(preset)) {
            parse = preset.parse($scope.options);
            format = preset.format($scope.options);
          }
          controller.setParser(parse);
          controller.setFormatter(format);
        }

        $scope.$watch('name', function(newValue, oldValue) {
          update(tartan.schema[$scope.name]);
        });
        update(tartan.schema[$scope.name]);
      }
    };
  }
]);
