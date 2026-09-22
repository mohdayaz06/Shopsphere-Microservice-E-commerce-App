(function () {
  'use strict';

  angular.module('shopSphereApp').factory('OrderService', OrderService);

  OrderService.$inject = ['$http', 'API_BASE_URL'];
  function OrderService($http, API_BASE_URL) {
    return {
      placeOrder: placeOrder,
      list: list,
      get: get,
      cancel: cancel,
    };

    function placeOrder(payload) {
      return $http.post(API_BASE_URL + '/orders', payload).then(function (response) {
        return response.data.data;
      });
    }

    function list(params) {
      return $http.get(API_BASE_URL + '/orders', { params: params || {} }).then(function (response) {
        return response.data;
      });
    }

    function get(id) {
      return $http.get(API_BASE_URL + '/orders/' + id).then(function (response) {
        return response.data.data;
      });
    }

    function cancel(id) {
      return $http.post(API_BASE_URL + '/orders/' + id + '/cancel').then(function (response) {
        return response.data.data;
      });
    }
  }
})();
