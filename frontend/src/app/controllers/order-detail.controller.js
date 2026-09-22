(function () {
  'use strict';

  angular.module('shopSphereApp').controller('OrderDetailController', OrderDetailController);

  OrderDetailController.$inject = ['$routeParams', 'OrderService', 'NotificationService'];
  function OrderDetailController($routeParams, OrderService, NotificationService) {
    var vm = this;

    vm.order = null;
    vm.isLoading = true;
    vm.errorMessage = '';
    vm.isCancelling = false;

    var STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    vm.timelineSteps = STEPS;
    vm.CANCELLABLE = ['PENDING', 'CONFIRMED', 'PROCESSING'];

    vm.cancelOrder = cancelOrder;
    vm.stepIndex = function () {
      return vm.order ? STEPS.indexOf(vm.order.status) : -1;
    };

    activate();

    function activate() {
      loadOrder();
    }

    function loadOrder() {
      vm.isLoading = true;
      OrderService.get($routeParams.id)
        .then(function (order) {
          vm.order = order;
        })
        .catch(function () {
          vm.errorMessage = 'This order could not be found.';
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    function cancelOrder() {
      var confirmed = window.confirm('Cancel this order? This cannot be undone.');
      if (!confirmed) return;

      vm.isCancelling = true;
      OrderService.cancel(vm.order.id)
        .then(function (order) {
          vm.order = order;
          NotificationService.success('Order cancelled.');
        })
        .catch(function (err) {
          NotificationService.error((err.data && err.data.message) || 'Could not cancel this order.');
        })
        .finally(function () {
          vm.isCancelling = false;
        });
    }
  }
})();
