(function () {
  'use strict';

  angular.module('shopSphereApp').controller('ProductDetailController', ProductDetailController);

  ProductDetailController.$inject = [
    '$routeParams', '$location', '$rootScope', 'ProductService', 'CartService', 'AuthService', 'NotificationService',
  ];
  function ProductDetailController($routeParams, $location, $rootScope, ProductService, CartService, AuthService, NotificationService) {
    var vm = this;

    vm.product = null;
    vm.isLoading = true;
    vm.errorMessage = '';
    vm.quantity = 1;
    vm.isAddingToCart = false;

    vm.increaseQty = increaseQty;
    vm.decreaseQty = decreaseQty;
    vm.addToCart = addToCart;
    vm.buyNow = buyNow;

    activate();

    function activate() {
      ProductService.get($routeParams.id)
        .then(function (product) {
          vm.product = product;
        })
        .catch(function () {
          vm.errorMessage = 'This product could not be found.';
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    function increaseQty() {
      if (vm.product && vm.quantity < vm.product.stock_quantity) vm.quantity++;
    }

    function decreaseQty() {
      if (vm.quantity > 1) vm.quantity--;
    }

    function addToCart() {
      if (!AuthService.isAuthenticated()) {
        NotificationService.info('Please sign in to add items to your cart.');
        $location.path('/login');
        return;
      }
      vm.isAddingToCart = true;
      CartService.addItem(vm.product.id, vm.quantity)
        .then(function (cart) {
          $rootScope.$broadcast('cart:updated', cart);
          NotificationService.success('"' + vm.product.name + '" added to cart.');
        })
        .catch(function (err) {
          NotificationService.error((err.data && err.data.message) || 'Could not add this item to your cart.');
        })
        .finally(function () {
          vm.isAddingToCart = false;
        });
    }

    function buyNow() {
      if (!AuthService.isAuthenticated()) {
        NotificationService.info('Please sign in to continue.');
        $location.path('/login');
        return;
      }
      vm.isAddingToCart = true;
      CartService.addItem(vm.product.id, vm.quantity)
        .then(function (cart) {
          $rootScope.$broadcast('cart:updated', cart);
          $location.path('/checkout');
        })
        .catch(function (err) {
          NotificationService.error((err.data && err.data.message) || 'Could not proceed to checkout.');
        })
        .finally(function () {
          vm.isAddingToCart = false;
        });
    }
  }
})();
