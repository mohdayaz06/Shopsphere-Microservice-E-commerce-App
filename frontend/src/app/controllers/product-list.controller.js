(function () {
  'use strict';

  angular.module('shopSphereApp').controller('ProductListController', ProductListController);

  ProductListController.$inject = [
    '$location', '$routeParams', '$rootScope', 'ProductService', 'CartService', 'AuthService', 'NotificationService',
  ];
  function ProductListController($location, $routeParams, $rootScope, ProductService, CartService, AuthService, NotificationService) {
    var vm = this;

    vm.products = [];
    vm.categories = [];
    vm.isLoading = true;
    vm.errorMessage = '';
    vm.pagination = { page: 1, limit: 12, total: 0, pages: 0 };

    vm.filters = {
      search: $routeParams.search || '',
      category: $routeParams.category || '',
      minPrice: $routeParams.minPrice || '',
      maxPrice: $routeParams.maxPrice || '',
      sort: $routeParams.sort || 'newest',
    };

    vm.applyFilters = applyFilters;
    vm.clearFilters = clearFilters;
    vm.setCategory = setCategory;
    vm.goToPage = goToPage;
    vm.addToCart = addToCart;

    activate();

    function activate() {
      ProductService.listCategories().then(function (categories) {
        vm.categories = categories;
      });
      loadProducts();
    }

    function loadProducts() {
      vm.isLoading = true;
      vm.errorMessage = '';

      var params = { page: vm.pagination.page, limit: vm.pagination.limit, sort: vm.filters.sort };
      if (vm.filters.search) params.search = vm.filters.search;
      if (vm.filters.category) params.category = vm.filters.category;
      if (vm.filters.minPrice) params.minPrice = vm.filters.minPrice;
      if (vm.filters.maxPrice) params.maxPrice = vm.filters.maxPrice;

      ProductService.list(params)
        .then(function (result) {
          vm.products = result.data;
          vm.pagination = { page: result.page, limit: vm.pagination.limit, total: result.total, pages: result.pages };
        })
        .catch(function () {
          vm.errorMessage = 'Could not load products right now.';
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    function applyFilters() {
      vm.pagination.page = 1;
      syncUrl();
      loadProducts();
    }

    function clearFilters() {
      vm.filters = { search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest' };
      vm.pagination.page = 1;
      syncUrl();
      loadProducts();
    }

    function setCategory(slug) {
      vm.filters.category = vm.filters.category === slug ? '' : slug;
      applyFilters();
    }

    function goToPage(page) {
      if (page < 1 || page > vm.pagination.pages) return;
      vm.pagination.page = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      loadProducts();
    }

    function syncUrl() {
      $location.search({
        search: vm.filters.search || null,
        category: vm.filters.category || null,
        minPrice: vm.filters.minPrice || null,
        maxPrice: vm.filters.maxPrice || null,
        sort: vm.filters.sort !== 'newest' ? vm.filters.sort : null,
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
