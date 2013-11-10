angular.module('febworms').directive('febwormsPropertyFieldCommon', function(febwormsPropertyFieldCommonLinkFn) {
  return {
    restrict: 'AE',
    templateUrl: 'febworms/edit/canvas/field/properties/property-field-common.tmpl.html',
    link: febwormsPropertyFieldCommonLinkFn
  };
}).factory('febwormsPropertyFieldCommonLinkFn', function() {
  return function($scope, $element, $attrs, ctrls) {

    $scope.fields = {
      fieldName: true,
      displayName: true,
      placeHolder: true
    };

    $scope.$watch($attrs['febwormsPropertyFieldCommon'], function(value) {
      $scope.fields = angular.extend($scope.fields, value);
    });
  };
});