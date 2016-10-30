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
          var schema = tartan.schema.default;

          function update() {
            sett = null;
            if (schema && $scope.source) {
              sett = schema.parse($scope.source);
              self.emit('tartan.changed', $scope.source, sett,
                schema.format(sett));
            }
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
