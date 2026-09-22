(function () {
  'use strict';

  angular.module('shopSphereApp').controller('CartController', CartController);

  CartController.$inject = ['$rootScope', 'CartService', 'NotificationService'];
  function CartController($rootScope, CartService, NotificationService) {
    var vm = this;

    vm.cart = { items: [], itemCount: 0, subtotal: 0 };
    vm.isLoading = true;
    vm.errorMessage = '';
    vm.updatingProductId = null;

    vm.increaseQty = increaseQty;
    vm.decreaseQty = decreaseQty;
    vm.removeItem = removeItem;

    activate();

    function activate() {
      loadCart();
    }

    function loadCart() {
      vm.isLoading = true;
      CartService.getCart()
        .then(function (cart) {
          vm.cart = cart;
        })
        .catch(function () {
          vm.errorMessage = 'Could not load your cart.';
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    function increaseQty(item) {
      updateQuantity(item, item.quantity + 1);
    }

    function decreaseQty(item) {
      updateQuantity(item, item.quantity - 1);
    }

    function updateQuantity(item, newQuantity) {
      vm.updatingProductId = item.product_id;
      CartService.updateItem(item.product_id, newQuantity)
        .then(function (cart) {
          vm.cart = cart;
          $rootScope.$broadcast('cart:updated', cart);
        })
        .catch(function (err) {
          NotificationService.error((err.data && err.data.message) || 'Could not update the quantity.');
        })
        .finally(function () {
          vm.updatingProductId = null;
        });
    }

    function removeItem(item) {
      vm.updatingProductId = item.product_id;
      CartService.removeItem(item.product_id)
        .then(function (cart) {
          vm.cart = cart;
          $rootScope.$broadcast('cart:updated', cart);
        })
        .catch(function (err) {
          NotificationService.error((err.data && err.data.message) || 'Could not remove this item.');
        })
        .finally(function () {
          vm.updatingProductId = null;
        });
    }
  }
})();
