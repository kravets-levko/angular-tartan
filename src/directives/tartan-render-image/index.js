'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var module = require('../../module');

function makeDraggable(window, canvas, getOffset, repaint) {
  var document = window.document;
  var drag = null;
  canvas.addEventListener('mousedown', function(event) {
    event = event || window.event;
    if (event.buttons == 1) {
      drag = {
        x: event.offsetX,
        y: event.offsetY
      };
      if (event.target && event.target.setCapture) {
        // Only IE and FF
        event.target.setCapture();
      }
    }
  });
  canvas.addEventListener('mousemove', function(event) {
    event = event || window.event;
    if (drag) {
      if (event.buttons != 1) {
        drag = null;
        if (document.releaseCapture) {
          // Only IE and FF
          document.releaseCapture();
        }
      } else {
        var offset = getOffset();
        offset.x += event.offsetX - drag.x;
        offset.y += event.offsetY - drag.y;

        drag.x = event.offsetX;
        drag.y = event.offsetY;
      }

      repaint();
    }
  });
  canvas.addEventListener('mouseup', function(event) {
    event = event || window.event;
    if (event.buttons == 1) {
      drag = null;
      if (document.releaseCapture) {
        // Only IE and FF
        document.releaseCapture();
      }
    }
    repaint();
  });
  canvas.addEventListener('losecapture', function() {
    // Only IE and FF
    drag = null;
  });
}

module.directive('tartanRenderImage', [
  '$window', '$timeout',
  function($window, $timeout) {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '<canvas ng-class="{\'infinite-image\': !!repeat}"></canvas>',
      replace: false,
      scope: {
        options: '=?',
        repeat: '=?',
        offset: '=?'
      },
      link: function($scope, element, attr, controller) {
        var target = element.find('canvas').get(0);
        var render = null;
        var lastSett = null;
        var offset = {x: 0, y: 0};

        function updateOffset() {
          $scope.offset = _.clone(offset);
        }

        $scope.$watch('offset', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            var temp = _.extend({}, offset, newValue);
            if ((temp.x != offset.x) || (temp.y != offset.y)) {
              offset = temp;
              repaint();
            }
          }
        }, true);

        var repaint = tartan.helpers.repaint(function() {
          offset = render(target, offset, !!$scope.repeat);
          $timeout(updateOffset);
        });

        function update(sett) {
          lastSett = sett;
          if (_.isObject(sett)) {
            var options = _.extend({}, $scope.options, {
              defaultColors: controller.getColors(),
              transformSett: tartan.transform.flatten()
            });
            render = tartan.render.canvas(sett, options);
            target.width = target.clientWidth;
            target.height = target.clientHeight;
          } else {
            render = tartan.render.canvas(); // Empty renderer
          }
          target.width = target.clientWidth;
          target.height = target.clientHeight;
          repaint();
        }

        update(controller.getSett());

        controller.on('tartan.changed', function(source, sett) {
          update(sett);
        });

        $scope.$watch('options', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            update(lastSett);
          }
        }, true);

        $scope.$watch('repeat', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            update(lastSett);
          }
        }, true);

        // Make it responsive
        $window.addEventListener('resize', function() {
          target.width = target.clientWidth;
          target.height = target.clientHeight;
          repaint();
        });

        // Make it draggable
        makeDraggable($window, target, function() {
          return offset;
        }, repaint);
      }
    };
  }
]);
