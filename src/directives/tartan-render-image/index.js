'use strict';

var tartan = require('tartan');
var module = require('../../module');

function makeDraggable(window, canvas, getOffset, repaint) {
  var drag = null;
  canvas.addEventListener('mousedown', function(event) {
    event = event || window.event;
    if (event.button == 0) {
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
      var offset = getOffset();
      offset.x += event.offsetX - drag.x;
      offset.y += event.offsetY - drag.y;

      drag.x = event.offsetX;
      drag.y = event.offsetY;

      repaint();
    }
  });
  canvas.addEventListener('mouseup', function(event) {
    event = event || window.event;
    if (event.button == 0) {
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
  '$window',
  function($window) {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '<canvas></canvas>',
      replace: false,
      scope: {},
      link: function($scope, element, attr, controller) {
        var target = element.find('canvas').get(0);
        var render = null;
        var offset = {x: 0, y: 0};

        var repaint = tartan.helpers.repaint(function() {
          offset = render(target, offset);
        });

        function update(sett) {
          if (_.isObject(sett)) {
            render = tartan.render.canvas(sett, {
              skipUnsupportedTokens: true,
              skipInvalidColors: true,
              transformSett: tartan.transform.flatten()
            });
            target.width = target.clientWidth;
            target.height = target.clientHeight;
          } else {
            render = tartan.render.canvas(); // Empty renderer
          }
          repaint();
        }

        update(controller.getSett());

        controller.on('tartan.changed', function(source, sett) {
          update(sett);
        });

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
