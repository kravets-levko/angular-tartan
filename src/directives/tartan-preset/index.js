'use strict';

var tartan = require('tartan');
var module = require('../../module');

function createParser() {
  return tartan.parse([
    tartan.parse.stripe(),
    tartan.parse.color(),
    tartan.parse.literal('['),
    tartan.parse.literal(']'),
    tartan.parse.literal('//'),
    tartan.parse.pivot()
  ], {
    failOnInvalidTokens: false,
    buildSyntaxTree: tartan.syntax.default({
      filterTokens: tartan.filter.removeTokens(
        tartan.defaults.insignificantTokens
      ),
      isWarpAndWeftSeparator: function(token) {
        return tartan.utils.isLiteral(token) && (token.value == '//');
      },
      transformSett: tartan.transform.optimize()
    })
  });
}

module.directive('tartanPreset', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '<pre></pre>',
      replace: false,
      scope: {
        name: '@'
      },
      link: function($scope, element, attr, controller) {
        controller.setParser(createParser());
      }
    };
  }
]);
