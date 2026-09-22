(function () {
  'use strict';

  angular.module('shopSphereApp').controller('OrdersController', OrdersController);

  OrdersController.$inject = ['OrderService'];
  function OrdersController(OrderService) {
    var vm = this;

    vm.orders = [];
    vm.isLoading = true;
    vm.errorMessage = '';
    vm.pagination = { page: 1, limit: 10, total: 0, pages: 0 };
    vm.goToPage = goToPage;

    activate();

    function activate() {
      loadOrders(1);
    }

    function loadOrders(page) {
      vm.isLoading = true;
      OrderService.list({ page: page, limit: vm.pagination.limit })
        .then(function (result) {
          vm.orders = result.data;
          vm.pagination = { page: result.page, limit: vm.pagination.limit, total: result.total, pages: result.pages };
        })
        .catch(function () {
          vm.errorMessage = 'Could not load your orders.';
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    function goToPage(page) {
      if (page < 1 || page > vm.pagination.pages) return;
      loadOrders(page);
    }
  }
})();
