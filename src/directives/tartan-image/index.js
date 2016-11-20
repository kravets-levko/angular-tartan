'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var ngTartan = require('../../module');

var parseSourcePattern = /^([\s\S]*?)\/([\s\S]*?)\/([\s\S]*)$/;

ngTartan.directive('tartanImage', [
  function() {
    return {
      restrict: 'E',
      template: '<canvas></canvas>',
      replace: true,
      scope: {
        // <schema>/<weave>/<sett (url-encoded)>
        source: '@?',
        // auto - to keep aspect ratio;
        // source - to use source dimension
        width: '@?',
        height: '@?'
      },
      link: function($scope, element) {
        var canvas = element.get(0);
        var render = null;
        var metrics = {width: 0, height: 0};

        var repaint = tartan.utils.repaint(function() {
          render(canvas, {x: 0, y: 0}, true);
        });

        function updateSource(source) {
          source = _.isString(source) ? source : '';
          var matches = parseSourcePattern.exec(source);
          if (matches) {
            source = [matches[3], matches[2], matches[1]];
          } else {
            source = [source, '', ''];
          }

          var schema = tartan.schema[source.pop().toLowerCase()] || null;
          if (!_.isObject(schema)) {
            schema = tartan.schema.classic;
          }
          var weave = _.chain(source.pop())
            .split(',')
            .map(function(value) {
              value = parseInt(value, 10);
              return value > 0 ? value : 0;
            })
            .filter()
            .value();

          source = source.join('/');

          var sett = schema.parse()(source);
          var options = {
            weave: weave,
            defaultColors: schema.colors,
            transformSyntaxTree: tartan.transform.flatten()
          };
          render = tartan.render.canvas(sett, options);
          metrics.width = render.metrics.warp.length;
          metrics.height = render.metrics.weft.length;
        }

        function updateCanvasSize() {
          var w;
          var h;

          var sw = ('' + $scope.width).toLowerCase();
          var sh = ('' + $scope.height).toLowerCase();

          if (sw == 'source') {
            w = metrics.width;
          } else
          if (sw != 'auto') {
            w = parseFloat($scope.width) || canvas.offsetWidth;
          }

          if (sh == 'source') {
            h = metrics.height;
          } else
          if (sh != 'auto') {
            h = parseFloat($scope.height) || canvas.offsetHeight;
          }

          if ((sw == 'auto') && (sh == 'auto')) {
            w = canvas.offsetWidth;
            h = canvas.offsetHeight;
          } else
          if (sw == 'auto') {
            w = height * metrics.width / metrics.height;
          } else
          if (sh == 'auto') {
            h = w * metrics.height / metrics.width;
          }

          w = Math.ceil(w);
          h = Math.ceil(h);

          if (canvas.width != w) {
            canvas.width = w;
          }
          if (canvas.height != h) {
            canvas.height = h;
          }

          repaint();
        }

        $scope.$watch('source', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            updateSource($scope.source);
            updateCanvasSize();
          }
        });

        $scope.$watch('width', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            updateCanvasSize();
          }
        });

        $scope.$watch('height', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            updateCanvasSize();
          }
        });

        updateSource($scope.source);
        updateCanvasSize();
      }
    };
  }
]);
