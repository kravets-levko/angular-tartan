'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var module = require('../../module');

module.directive('tartanMetrics', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '',
      replace: false,
      scope: {
        options: '=?',
        model: '='
      },
      link: function($scope, element, attr, controller) {
        function createCalculator() {
          return tartan.render.metrics(_.extend({
            skipUnsupportedTokens: true,
            skipInvalidColors: true
          }, $scope.options, {
            transformSett: tartan.transform.flatten()
          }));
        }

        var calculator = createCalculator();
        var lastSett = null;

        function update(sett) {
          lastSett = sett;
          if (_.isObject(sett)) {
            $scope.model = calculator(sett);
          } else {
            $scope.model = calculator({colors: {}, warp: [], weft: []});
          }
        }

        update(controller.getSett());

        $scope.$watch('options', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            calculator = createCalculator();
            update(lastSett);
          }
        }, true);

        controller.on('tartan.changed', function(source, sett) {
          update(sett);
        });
      }
    };
  }
]);
