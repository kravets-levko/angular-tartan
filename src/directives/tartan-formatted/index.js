'use strict';

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
        function tartanChanged(state) {
          element.text(state.formatted);
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
