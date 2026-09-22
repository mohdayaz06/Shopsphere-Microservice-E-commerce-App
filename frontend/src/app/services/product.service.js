(function () {
  'use strict';

  angular.module('shopSphereApp').factory('ProductService', ProductService);

  ProductService.$inject = ['$http', 'API_BASE_URL'];
  function ProductService($http, API_BASE_URL) {
    return {
      list: list,
      get: get,
      listCategories: listCategories,
      listFeatured: listFeatured,
      listNewArrivals: listNewArrivals,
    };

    function list(params) {
      return $http.get(API_BASE_URL + '/products', { params: params || {} }).then(function (response) {
        return response.data;
      });
    }

    function get(id) {
      return $http.get(API_BASE_URL + '/products/' + id).then(function (response) {
        return response.data.data;
      });
    }

    function listCategories() {
      return $http.get(API_BASE_URL + '/categories').then(function (response) {
        return response.data.data;
      });
    }

    function listFeatured(limit) {
      return $http
        .get(API_BASE_URL + '/products', { params: { featured: true, limit: limit || 8 } })
        .then(function (response) {
          return response.data.data;
        });
    }

    function listNewArrivals(limit) {
      return $http
        .get(API_BASE_URL + '/products', { params: { newArrival: true, limit: limit || 8 } })
        .then(function (response) {
          return response.data.data;
        });
    }
  }
})();
