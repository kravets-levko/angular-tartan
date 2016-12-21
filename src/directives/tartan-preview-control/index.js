'use strict';

var angular = require('angular');
var tartan = require('tartan');
var ngTartan = require('../../module');

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
    if (angular.isFunction(update)) {
      update();
    }
  }

  window.addEventListener('resize', onResize);
  return function() {
    window.removeEventListener('mousedown', onResize);
  };
}

ngTartan.directive('tartanPreviewControl', [
  '$window', '$timeout',
  function($window, $timeout) {
    return {
      restrict: 'E',
      require: '^^tartan',
      template:
        '<div class="tartan-preview-control">' +
          '<canvas></canvas>' +
        '</div>',
      replace: true,
      scope: {
        weave: '=?',
        repeat: '=?',
        offset: '=?',
        metrics: '=?',
        interactive: '=?',
        zoom: '=?',
        renderer: '=?'
      },
      link: function($scope, element, attr, controller) {
        element.css({
          position: 'relative'
        });

        var target = element.find('canvas');
        var canvas = target.get(0);
        var parent = target.parent().get(0);
        var render = null;
        var currentState = null;
        var offset = {x: 0, y: 0};

        $scope.interactiveOptions = {
          resize: false,
          drag: false
        };

        function updateOffset() {
          $scope.offset = angular.extend({}, offset);
        }

        var repaint = tartan.utils.repaint(function() {
          if (!$scope.interactive) {
            offset = {x: 0, y: 0};
          }
          offset = render(canvas, offset, !!$scope.repeat);
          $timeout(updateOffset);
        });

        function update() {
          var options = {
            zoom: $scope.zoom,
            weave: $scope.weave,
            defaultColors: currentState.colors,
            transformSyntaxTree: tartan.transform.flatten()
          };

          var renderer = tartan.render[$scope.renderer];
          if (!angular.isFunction(renderer)) {
            renderer = tartan.render.canvas;
            if (angular.isString($scope.renderer)) {
              for (var key in tartan.render) {
                if (
                  angular.isFunction(tartan.render[key]) &&
                  angular.isString(tartan.render[key].id) &&
                  (tartan.render[key].id == $scope.renderer)
                ) {
                  renderer = tartan.render[key];
                  break;
                }
              }
            }
          }

          render = renderer(currentState.sett, options);
          $scope.metrics = render.metrics;
          updateCanvasSize();
        }

        function tartanChanged(state) {
          currentState = state;
          update();
          $scope.$applyAsync();
        }

        controller.on('tartan.changed', tartanChanged);

        controller.requestUpdate(tartanChanged);

        ['weave', 'repeat', 'zoom', 'renderer'].forEach(function(name) {
          $scope.$watch(name, function(newValue, oldValue) {
            if (newValue !== oldValue) {
              update();
            }
          }, true);
        });

        $scope.$watch('offset', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            var temp = angular.extend({}, offset, newValue);
            if ((temp.x != offset.x) || (temp.y != offset.y)) {
              offset = temp;
              repaint();
            }
          }
        }, true);

        var disableResize = null;
        var disableDrag = null;

        $scope.$watch('interactive', function() {
          var interactive = angular.extend({
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
          } else if (disableResize) {
            // Disable it later, but NULL it now
            disable.push(disableResize);
            disableResize = null;
          }

          if (interactive.drag) {
            if (!disableDrag) {
              disableDrag = makeDraggable($window, canvas, function() {
                return offset;
              }, repaint);
            }
          } else if (disableDrag) {
            // Disable it later, but NULL it now
            disable.push(disableDrag);
            disableDrag = null;
          }
          repaint();

          // Safely run each callback - even if one of them will
          // crash - it doesn't matter at the moment
          disable.forEach(function(disable) {
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
          controller.off('tartan.changed', tartanChanged);
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
