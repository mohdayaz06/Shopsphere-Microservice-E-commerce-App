(function () {
  'use strict';

  angular.module('shopSphereApp').factory('AuthService', AuthService);

  AuthService.$inject = ['$http', 'API_BASE_URL'];
  function AuthService($http, API_BASE_URL) {
    var TOKEN_KEY = 'shopsphere_token';
    var USER_KEY = 'shopsphere_user';

    return {
      register: register,
      login: login,
      logout: logout,
      isAuthenticated: isAuthenticated,
      getCurrentUser: getCurrentUser,
      fetchProfile: fetchProfile,
      updateProfile: updateProfile,
      listAddresses: listAddresses,
      addAddress: addAddress,
      deleteAddress: deleteAddress,
    };

    function register(payload) {
      return $http.post(API_BASE_URL + '/users/register', payload).then(function (response) {
        persistSession(response.data.data);
        return response.data.data;
      });
    }

    function login(credentials) {
      return $http.post(API_BASE_URL + '/users/login', credentials).then(function (response) {
        persistSession(response.data.data);
        return response.data.data;
      });
    }

    function logout() {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    }

    function isAuthenticated() {
      return !!window.localStorage.getItem(TOKEN_KEY);
    }

    function getCurrentUser() {
      var raw = window.localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    }

    function fetchProfile() {
      return $http.get(API_BASE_URL + '/users/profile').then(function (response) {
        return response.data.data;
      });
    }

    function updateProfile(payload) {
      return $http.put(API_BASE_URL + '/users/profile', payload).then(function (response) {
        return response.data.data;
      });
    }

    function listAddresses() {
      return $http.get(API_BASE_URL + '/users/addresses').then(function (response) {
        return response.data.data;
      });
    }

    function addAddress(payload) {
      return $http.post(API_BASE_URL + '/users/addresses', payload).then(function (response) {
        return response.data.data;
      });
    }

    function deleteAddress(id) {
      return $http.delete(API_BASE_URL + '/users/addresses/' + id);
    }

    function persistSession(data) {
      window.localStorage.setItem(TOKEN_KEY, data.token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
  }
})();
