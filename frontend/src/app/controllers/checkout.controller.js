(function () {
  'use strict';

  angular.module('shopSphereApp').controller('CheckoutController', CheckoutController);

  CheckoutController.$inject = [
    '$location', '$rootScope', 'CartService', 'OrderService', 'AuthService', 'NotificationService',
  ];
  function CheckoutController($location, $rootScope, CartService, OrderService, AuthService, NotificationService) {
    var vm = this;

    vm.cart = { items: [], itemCount: 0, subtotal: 0 };
    vm.isLoading = true;
    vm.isPlacingOrder = false;
    vm.errorMessage = '';
    vm.placedOrder = null;

    var user = AuthService.getCurrentUser();
    vm.shippingAddress = {
      fullName: user ? user.fullName : '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    };
    vm.paymentMethod = 'CARD';

    // Estimated pricing shown pre-checkout - the authoritative numbers
    // come back from Order Service in the response, since only it knows
    // the current tax rate / shipping threshold configuration.
    vm.estimatedTax = 0;
    vm.estimatedShipping = 0;
    vm.estimatedTotal = 0;

    vm.selectPaymentMethod = selectPaymentMethod;
    vm.placeOrder = placeOrder;

    activate();

    function activate() {
      CartService.getCart()
        .then(function (cart) {
          vm.cart = cart;
          if (!cart.items.length) {
            $location.path('/cart');
            return;
          }
          estimateTotals(cart.subtotal);
        })
        .catch(function () {
          vm.errorMessage = 'Could not load your cart.';
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    // Mirrors order-service's TAX_RATE/FREE_SHIPPING_THRESHOLD/FLAT_SHIPPING_COST
    // defaults purely for a pre-checkout estimate; the real total is
    // computed server-side and is what's actually charged.
    function estimateTotals(subtotal) {
      vm.estimatedTax = Math.round(subtotal * 0.05 * 100) / 100;
      vm.estimatedShipping = subtotal >= 999 ? 0 : 79;
      vm.estimatedTotal = Math.round((subtotal + vm.estimatedTax + vm.estimatedShipping) * 100) / 100;
    }

    function selectPaymentMethod(method) {
      vm.paymentMethod = method;
    }

    function placeOrder(addressForm) {
      if (addressForm.$invalid) {
        vm.errorMessage = 'Please fill in all required shipping fields.';
        return;
      }

      vm.isPlacingOrder = true;
      vm.errorMessage = '';

      OrderService.placeOrder({
        shippingAddress: vm.shippingAddress,
        paymentMethod: vm.paymentMethod,
      })
        .then(function (order) {
          vm.placedOrder = order;
          $rootScope.$broadcast('cart:updated', { itemCount: 0 });
          NotificationService.success('Order placed successfully!');
        })
        .catch(function (err) {
          vm.errorMessage = (err.data && err.data.message) || 'Could not place your order. Please try again.';
        })
        .finally(function () {
          vm.isPlacingOrder = false;
        });
    }
  }
})();
