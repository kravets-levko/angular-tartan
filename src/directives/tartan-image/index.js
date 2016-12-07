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
        height: '@?',
        renderer: '@?',
        zoom: '@?'
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
            zoom: $scope.zoom,
            weave: weave,
            defaultColors: schema.colors,
            transformSyntaxTree: tartan.transform.flatten()
          };

          var renderer = tartan.render[$scope.renderer];
          if (!_.isFunction(renderer)) {
            renderer = _.find(tartan.render, {
              id: $scope.renderer
            });
            if (!_.isFunction(renderer)) {
              renderer = tartan.render.canvas;
            }
          }

          render = renderer(sett, options);
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
            w = h * metrics.width / metrics.height;
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

        _.each(['source', 'zoom', 'renderer'], function(name) {
          $scope.$watch(name, function(newValue, oldValue) {
            if (newValue !== oldValue) {
              updateSource($scope.source);
              updateCanvasSize();
            }
          }, true);
        });

        _.each(['width', 'height'], function(name) {
          $scope.$watch(name, function(newValue, oldValue) {
            if (newValue !== oldValue) {
              updateCanvasSize();
            }
          }, true);
        });

        updateSource($scope.source);
        updateCanvasSize();
      }
    };
  }
]);
