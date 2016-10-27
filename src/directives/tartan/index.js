'use strict';

var _ = require('lodash');
var EventEmitter = require('events');
var module = require('../../module');

function stub() {
  return null;
}

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

          var parser = stub;
          var formatter = stub;
          var sett = null;

          function update() {
            sett = null;
            if (parser && $scope.source) {
              sett = parser($scope.source);
              self.emit('tartan.changed', $scope.source, sett,
                formatter(sett));
            }
          }

          this.getSett = function() {
            return sett;
          };

          this.setParser = function(value) {
            parser = _.isFunction(value) ? value : stub;
            update();
          };

          this.setFormatter = function(value) {
            formatter = _.isFunction(value) ? value : stub;
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
