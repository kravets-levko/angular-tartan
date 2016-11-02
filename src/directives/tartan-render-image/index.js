'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var module = require('../../module');

function makeDraggable(window, canvas, getOffset, repaint) {
  var document = window.document;
  var drag = null;
  var dragTarget = document.releaseCapture ? canvas : window;
  dragTarget.addEventListener('mousedown', function(event) {
    event = event || window.event;
    if (event.target !== canvas) {
      return;
    }
    if (event.buttons == 1) {
      event.preventDefault();
      drag = {
        x: event.clientX,
        y: event.clientY
      };
      if (event.target && event.target.setCapture) {
        // Only IE and FF
        event.target.setCapture();
      }
    }
  });
  dragTarget.addEventListener('mousemove', function(event) {
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
        offset.x += event.clientX - drag.x;
        offset.y += event.clientY - drag.y;

        drag.x = event.clientX;
        drag.y = event.clientY;

        event.preventDefault();
      }

      repaint();
    }
  });
  dragTarget.addEventListener('mouseup', function(event) {
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
      template:
        '<div class="tartan-render-image" style="position:relative;">' +
        '<canvas ng-class="{\'infinite-image\': !!repeat}"></canvas>' +
        '</div>',
      replace: false,
      scope: {
        options: '=?',
        repeat: '=?',
        offset: '=?',
        interactive: '=?'
      },
      link: function($scope, element, attr, controller) {
        var target = element.find('canvas');
        var canvas = target.get(0);
        var parent = target.parent().get(0);
        var render = null;
        var lastSett = null;
        var offset = {x: 0, y: 0};

        function updateOffset() {
          $scope.offset = _.clone(offset);
        }

        var repaint = tartan.helpers.repaint(function() {
          if (!$scope.interactive) {
            offset = {x: 0, y: 0};
          }
          offset = render(canvas, offset, !!$scope.repeat);
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
          } else {
            render = tartan.render.canvas(); // Empty renderer
          }
          updateCanvasSize();
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
        });

        $scope.$watch('offset', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            var temp = _.extend({}, offset, newValue);
            if ((temp.x != offset.x) || (temp.y != offset.y)) {
              offset = temp;
              repaint();
            }
          }
        }, true);

        $scope.$watch('interactive', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            repaint();
          }
        });

        // Make it responsive
        function updateCanvasSize() {
          var w = Math.ceil(parent.offsetWidth);
          var h = Math.ceil(parent.offsetHeight);
          target.css({
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: w + 'px',
            height: h + 'px'
          });
          if (canvas.width != w) {
            canvas.width = w;
          }
          if (canvas.height != h) {
            canvas.height = h;
          }
          repaint();
        }
        $window.addEventListener('resize', updateCanvasSize);
        $scope.$on('$destroy', function() {
          $window.removeEventListener('resize', updateCanvasSize);
        });

        // Make it draggable
        makeDraggable($window, canvas, function() {
          return !!$scope.interactive ? offset : {x: 0, y: 0};
        }, repaint);
      }
    };
  }
]);
