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
        function update(schema) {
          if (_.isObject(schema)) {
            schema = _.clone(schema);
            schema.parse = schema.parse($scope.options);
            schema.format = schema.format($scope.options);
          } else {
            schema = null;
          }
          controller.setSchema(schema);
        }

        $scope.$watch('name', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            update(tartan.schema[$scope.name]);
          }
        });
        update(tartan.schema[$scope.name]);
      }
    };
  }
]);
