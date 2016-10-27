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
        var format = tartan.render.format({
          outputOnlyUsedColors: true
        });

        function update(sett) {
          if (_.isObject(sett)) {
            target.text(format(sett));
          } else {
            target.text('');
          }
        }

        update(controller.getSett());

        controller.on('tartan.changed', function(source, sett) {
          update(sett);
        });
      }
    };
  }
]);
