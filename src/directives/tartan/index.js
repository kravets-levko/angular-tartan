'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var EventEmitter = require('events');
var module = require('../../module');

module.directive('tartan', [
  function() {
    return {
      restrict: 'E',
      template: '',
      replace: false,
      scope: {
        source: '@'
      },
      controller: [
        '$scope',
        function($scope) {
          var self = this;

          // Allow controller to have events
          _.extend(self, new EventEmitter());

          var sett = null;
          var errorHandler = null;
          var schema = tartan.schema.default;

          function update() {
            sett = null;
            self.emit('tartan.beginUpdate');
            if (schema && $scope.source) {
              sett = schema.parse($scope.source);
              self.emit('tartan.changed', $scope.source, sett,
                schema.format(sett));
            }
            self.emit('tartan.endUpdate');
          }

          this.getSett = function() {
            return sett;
          };

          this.getColors = function() {
            return schema.colors;
          };

          this.getSchema = function() {
            return schema;
          };

          this.getErrorHandler = function() {
            return errorHandler;
          };

          this.setErrorHandler = function(value) {
            errorHandler = value;
            self.emit('tartan.updateSchema');
          };

          this.setSchema = function(value) {
            schema = _.isObject(value) ? value : tartan.schema.default;
            update();
          };

          $scope.$watch('source', function(newValue, oldValue) {
            if (newValue !== oldValue) {
              update();
            }
          });
        }
      ]
    };
  }
]);
