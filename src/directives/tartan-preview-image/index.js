'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var ngTartan = require('../../module');

ngTartan.directive('tartanPreviewImage', [
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
        var currentState = null;

        var repaint = tartan.utils.repaint(function() {
          render(canvas, {x: 0, y: 0}, true);
        });

        function update() {
          var options = {
            weave: $scope.weave,
            defaultColors: currentState.colors,
            transformSyntaxTree: tartan.transform.flatten()
          };
          render = tartan.render.canvas(currentState.sett, options);
          $scope.metrics = render.metrics;
          updateCanvasSize();
        }

        controller.requestUpdate(function(state) {
          currentState = state;
          update();
        });

        controller.on('tartan.changed', function(state) {
          currentState = state;
          update();
          $scope.$applyAsync();
        });

        $scope.$watch('weave', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            update();
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
