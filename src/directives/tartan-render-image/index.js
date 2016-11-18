'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var module = require('../../module');

function makeDraggable(window, canvas, getOffset, repaint) {
  var document = window.document;
  var drag = null;
  var dragTarget = document.releaseCapture ? canvas : window;

  function onMouseDown(event) {
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
  }
  function onMouseMove(event) {
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
  }
  function onMouseUp(event) {
    event = event || window.event;
    if (event.buttons == 1) {
      drag = null;
      if (document.releaseCapture) {
        // Only IE and FF
        document.releaseCapture();
      }
    }
    repaint();
  }
  function onLoseCapture() {
    // Only IE and FF
    drag = null;
  }

  dragTarget.addEventListener('mousedown', onMouseDown);
  dragTarget.addEventListener('mousemove', onMouseMove);
  dragTarget.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('losecapture', onLoseCapture);

  return function() {
    dragTarget.removeEventListener('mousedown', onMouseDown);
    dragTarget.removeEventListener('mousemove', onMouseMove);
    dragTarget.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('losecapture', onLoseCapture);
  };
}

function makeResizable(window, update) {
  function onResize() {
    if (_.isFunction(update)) {
      update();
    }
  }

  window.addEventListener('resize', onResize);
  return function() {
    window.removeEventListener('mousedown', onResize);
  };
}

module.directive('tartanRenderImage', [
  '$window', '$timeout',
  function($window, $timeout) {
    return {
      restrict: 'E',
      require: '^^tartan',
      template:
        '<div class="tartan-render-image" style="position: relative;">' +
          '<canvas></canvas>' +
        '</div>',
      replace: false,
      scope: {
        options: '=?',
        repeat: '=?',
        offset: '=?',
        metrics: '=?',
        interactive: '=?'
      },
      link: function($scope, element, attr, controller) {
        var target = element.find('canvas');
        var canvas = target.get(0);
        var parent = target.parent().get(0);
        var render = null;
        var lastSett = null;
        var offset = {x: 0, y: 0};

        $scope.interactiveOptions = {
          resize: false,
          drag: false
        };

        function updateOffset() {
          $scope.offset = _.clone(offset);
        }

        var repaint = tartan.utils.repaint(function() {
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
              transformSyntaxTree: tartan.transform.flatten()
            });
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

        var disableResize = null;
        var disableDrag = null;

        $scope.$watch('interactive', function() {
          var interactive = _.extend({
            resize: false,
            drag: false
          }, $scope.interactive === true ? {
            resize: true,
            drag: true
          } : $scope.interactive);
          $scope.interactiveOptions = interactive;

          var disable = [];
          if (interactive.resize) {
            if (!disableResize) {
              disableResize = makeResizable($window, updateCanvasSize);
            }
          } else {
            if (disableResize) {
              // Disable it later, but NULL it now
              disable.push(disableResize);
              disableResize = null;
            }
          }

          if (interactive.drag) {
            if (!disableDrag) {
              disableDrag = makeDraggable($window, canvas, function() {
                return offset;
              }, repaint);
            }
          } else {
            if (disableDrag) {
              // Disable it later, but NULL it now
              disable.push(disableDrag);
              disableDrag = null;
            }
          }
          repaint();

          // Safely run each callback - even if one of them will
          // crash - it doesn't matter at the moment
          _.each(disable, function(disable) {
            disable();
          });
        });

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

        $scope.$on('$destroy', function() {
          if (disableDrag) {
            disableDrag();
          }
          if (disableResize) {
            disableResize();
          }
        });
      }
    };
  }
]);
