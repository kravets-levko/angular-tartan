'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var module = require('../../module');

module.directive('tartanPreviewImage', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '<canvas class="tartan-preview-image"></canvas>',
      replace: false,
      scope: {
        weave: '=?',
        metrics: '=?'
      },
      link: function($scope, element, attr, controller) {
        var canvas = element.find('canvas').get(0);
        var render = null;
        var lastSett = null;

        var repaint = tartan.utils.repaint(function() {
          render(canvas, {x: 0, y: 0}, true);
        });

        function update(sett) {
          lastSett = sett;
          if (_.isObject(sett)) {
            var options = {
              weave: $scope.weave,
              defaultColors: controller.getColors(),
              transformSyntaxTree: tartan.transform.flatten()
            };
            render = tartan.render.canvas(sett, options);
          } else {
            render = tartan.render.canvas(); // Empty renderer
          }
          $scope.metrics = render.metrics;
          updateCanvasSize();
        }

        update(controller.getSett());

        controller.on('tartan.changed', function(source, sett) {
          update(sett);
          $scope.$applyAsync();
        });

        $scope.$watch('weave', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            update(lastSett);
          }
        }, true);

        function updateCanvasSize() {
          var w = Math.ceil(canvas.offsetWidth);
          var h = Math.ceil(canvas.offsetHeight);
          if (canvas.width != w) {
            canvas.width = w;
          }
          if (canvas.height != h) {
            canvas.height = h;
          }
          repaint();
        }
      }
    };
  }
]);
