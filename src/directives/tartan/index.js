'use strict';

var _ = require('lodash');
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

          var parser = null;
          var sett = null;

          function update() {
            sett = null;
            if (parser && $scope.source) {
              sett = parser($scope.source);
              self.emit('tartan.changed', $scope.source, sett);
            }
          }

          this.getSett = function() {
            return sett;
          };

          this.setParser = function(newParser) {
            parser = _.isFunction(newParser) ? newParser : null;
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
