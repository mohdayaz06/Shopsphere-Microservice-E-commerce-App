(function () {
  'use strict';

  angular.module('shopSphereApp').factory('CartService', CartService);

  CartService.$inject = ['$http', 'API_BASE_URL'];
  function CartService($http, API_BASE_URL) {
    return {
      getCart: getCart,
      addItem: addItem,
      updateItem: updateItem,
      removeItem: removeItem,
      clearCart: clearCart,
    };

    function getCart() {
      return $http.get(API_BASE_URL + '/cart').then(function (response) {
        return response.data.data;
      });
    }

    function addItem(productId, quantity) {
      return $http
        .post(API_BASE_URL + '/cart/items', { productId: productId, quantity: quantity || 1 })
        .then(function (response) {
          return response.data.data;
        });
    }

    function updateItem(productId, quantity) {
      return $http
        .put(API_BASE_URL + '/cart/items/' + productId, { quantity: quantity })
        .then(function (response) {
          return response.data.data;
        });
    }

    function removeItem(productId) {
      return $http.delete(API_BASE_URL + '/cart/items/' + productId).then(function (response) {
        return response.data.data;
      });
    }

    function clearCart() {
      return $http.delete(API_BASE_URL + '/cart').then(function (response) {
        return response.data.data;
      });
    }
  }
})();
