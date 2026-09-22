(function () {
  'use strict';

  angular.module('shopSphereApp').controller('ShellController', ShellController);

  ShellController.$inject = [
    '$location', '$rootScope', 'AuthService', 'CartService', 'ProductService', 'NotificationService',
  ];
  function ShellController($location, $rootScope, AuthService, CartService, ProductService, NotificationService) {
    var vm = this;

    vm.currentUser = AuthService.getCurrentUser();
    vm.cartCount = 0;
    vm.categories = [];
    vm.searchTerm = '';
    vm.toasts = NotificationService.toasts;

    vm.logout = logout;
    vm.dismissToast = NotificationService.dismiss;
    vm.submitSearch = submitSearch;
    vm.isActive = isActive;
    vm.initials = initials;

    activate();

    function activate() {
      ProductService.listCategories().then(function (categories) {
        vm.categories = categories;
      });
      refreshCartCount();

      // Refresh session-dependent state (cart badge, user chip) whenever
      // navigation happens - e.g. right after login, or after checkout
      // clears the cart.
      $rootScope.$on('$routeChangeSuccess', function () {
        vm.currentUser = AuthService.getCurrentUser();
        refreshCartCount();
      });

      $rootScope.$on('cart:updated', function (event, cart) {
        vm.cartCount = cart ? cart.itemCount : 0;
      });
    }

    function refreshCartCount() {
      if (!AuthService.isAuthenticated()) {
        vm.cartCount = 0;
        return;
      }
      CartService.getCart().then(function (cart) {
        vm.cartCount = cart.itemCount;
      });
    }

    function logout() {
      AuthService.logout();
      vm.currentUser = null;
      vm.cartCount = 0;
      $location.path('/login');
    }

    function submitSearch() {
      if (!vm.searchTerm) return;
      $location.path('/products').search({ search: vm.searchTerm });
    }

    function isActive(path) {
      return $location.path().indexOf(path) === 0;
    }

    function initials(name) {
      if (!name) return '?';
      var parts = name.trim().split(/\s+/);
      return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    }
  }
})();
