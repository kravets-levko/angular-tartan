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
        model: '='
      },
      link: function($scope, element, attr, controller) {
        var calculator = tartan.render.metrics({
          skipUnsupportedTokens: true,
          skipInvalidColors: true,
          transformSett: tartan.transform.flatten()
        });

        function update(sett) {
          if (_.isObject(sett)) {
            $scope.model = calculator(sett);
          } else {
            $scope.model = calculator({colors: {}, warp: [], weft: []});
          }
        }

        update(controller.getSett());

        controller.on('tartan.changed', function(source, sett) {
          update(sett);
        });
      }
    };
  }
]);
