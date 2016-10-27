'use strict';

var tartan = require('tartan');
var module = require('../../module');

module.directive('tartanFormat', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '<pre></pre>',
      replace: false,
      scope: {},
      link: function($scope, element, attr, controller) {
        var target = element.find('pre');
        controller.on('tartan.changed', function(source, sett, formatted) {
          target.text(formatted);
        });
      }
    };
  }
]);
