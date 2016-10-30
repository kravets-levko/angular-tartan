'use strict';

var _ = require('lodash');
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

        var sett = controller.getSett();
        var schema = controller.getSchema();
        if (_.isObject(sett) && _.isObject(schema)) {
          target.text(schema.format(sett));
        }
      }
    };
  }
]);
