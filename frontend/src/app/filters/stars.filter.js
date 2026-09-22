(function () {
  'use strict';

  /** Usage: {{ 4.5 | starsArray }} -> ['full','full','full','full','half'] for ng-repeat */
  angular.module('shopSphereApp').filter('starsArray', starsArrayFilter);

  function starsArrayFilter() {
    return function (rating) {
      var stars = [];
      var r = Math.round((Number(rating) || 0) * 2) / 2;
      for (var i = 1; i <= 5; i++) {
        if (r >= i) stars.push('full');
        else if (r >= i - 0.5) stars.push('half');
        else stars.push('empty');
      }
      return stars;
    };
  }
})();
