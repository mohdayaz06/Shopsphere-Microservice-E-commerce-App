(function () {
  'use strict';

  angular.module('shopSphereApp').controller('HomeController', HomeController);

  HomeController.$inject = ['$rootScope', 'ProductService', 'CartService', 'AuthService', 'NotificationService'];
  function HomeController($rootScope, ProductService, CartService, AuthService, NotificationService) {
    var vm = this;

    vm.featured = [];
    vm.newArrivals = [];
    vm.categories = [];
    vm.isLoading = true;
    vm.addToCart = addToCart;

    activate();

    function activate() {
      ProductService.listFeatured(8).then(function (products) { vm.featured = products; });
      ProductService.listNewArrivals(8).then(function (products) { vm.newArrivals = products; });
      ProductService.listCategories().then(function (categories) {
        vm.categories = categories;
        vm.isLoading = false;
      });
    }

    function addToCart(product, $event) {
      if ($event) $event.preventDefault();
      if (!AuthService.isAuthenticated()) {
        NotificationService.info('Please sign in to add items to your cart.');
        return;
      }
      CartService.addItem(product.id, 1).then(function (cart) {
        $rootScope.$broadcast('cart:updated', cart);
        NotificationService.success('"' + product.name + '" added to cart.');
      }).catch(function (err) {
        NotificationService.error((err.data && err.data.message) || 'Could not add this item to your cart.');
      });
    }
  }
})();
