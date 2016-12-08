'use strict';

var angular = require('angular');
var tartan = require('tartan');
var EventEmitter = require('events');
var ngTartan = require('../../module');

ngTartan.directive('tartan', [
  function() {
    return {
      restrict: 'E',
      template: '',
      replace: false,
      scope: {
        source: '@?',
        schema: '@?',
        options: '=?'
      },
      controller: [
        '$scope',
        function($scope) {
          var self = this;

          // Allow controller to emit events
          self._events = new EventEmitter();
          self.emit = angular.bind(self._events, self._events.emit);
          self.on = angular.bind(self._events, self._events.addListener);
          self.off = angular.bind(self._events, self._events.removeListener);

          var errorHandler = null;
          var parse = null;
          var format = null;

          var state = {
            schema: null,
            source: null,
            sett: null,
            formatted: null,
            colors: null
          };

          function updateSchema() {
            var schema = tartan.schema[$scope.schema] || tartan.schema.classic;
            parse = schema.parse(angular.extend({}, $scope.options, {
              errorHandler: errorHandler
            }));
            format = schema.format(angular.extend({}, $scope.options));

            state = {
              schema: schema,
              source: null,
              sett: null,
              formatted: null,
              colors: schema.colors
            };

            updateSource();
          }

          function updateSource() {
            self.emit('tartan.beginUpdate');

            var sett = parse($scope.source);
            state = angular.extend({}, state, {
              source: $scope.source,
              sett: sett,
              formatted: format(sett)
            });

            self.emit('tartan.changed', state);
            self.emit('tartan.endUpdate');
          }

          this.requestUpdate = function(callback) {
            if (angular.isFunction(callback)) {
              callback(state);
            }
          };

          this.getErrorHandler = function() {
            return errorHandler;
          };

          this.setErrorHandler = function(value) {
            errorHandler = value;
            updateSchema();
          };

          updateSchema();

          $scope.$watch('schema', function(newValue, oldValue) {
            if (newValue !== oldValue) {
              updateSchema();
            }
          });

          $scope.$watch('options', function(newValue, oldValue) {
            if (newValue !== oldValue) {
              updateSchema();
            }
          }, true);

          $scope.$watch('source', function(newValue, oldValue) {
            if (newValue !== oldValue) {
              updateSource();
            }
          });
        }
      ]
    };
  }
]);
