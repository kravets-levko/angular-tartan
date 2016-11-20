'use strict';

var _ = require('lodash');
var ngTartan = require('../../module');

ngTartan.directive('tartanFormatted', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '<pre></pre>',
      replace: false,
      scope: {},
      link: function($scope, element, attr, controller) {
        var target = element.find('pre');

        function update(state) {
          target.text(state.formatted);
        }

        controller.on('tartan.changed', update);

        controller.requestUpdate(update);
      }
    };
  }
]);
