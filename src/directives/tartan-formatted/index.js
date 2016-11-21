'use strict';

var _ = require('lodash');
var ngTartan = require('../../module');

ngTartan.directive('tartanFormatted', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '<pre></pre>',
      replace: true,
      scope: {},
      link: function($scope, element, attr, controller) {
        var target = element.find('pre');

        function tartanChanged(state) {
          target.text(state.formatted);
        }

        controller.on('tartan.changed', tartanChanged);

        controller.requestUpdate(tartanChanged);

        $scope.$on('$destroy', function() {
          controller.off('tartan.changed', tartanChanged);
        });
      }
    };
  }
]);
