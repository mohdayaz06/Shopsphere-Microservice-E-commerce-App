(function () {
  'use strict';

  angular
    .module('shopSphereApp')
    /**
     * The ONE address the frontend knows about. Every request goes to the
     * API Gateway, which routes it to the right microservice - the
     * frontend never talks to user-service/product-service/etc directly.
     */
    .constant('API_BASE_URL', 'http://16.4.54.7:8000/api')
    .config(routeConfig)
    .run(runBlock);

  routeConfig.$inject = ['$routeProvider', '$locationProvider'];
  function routeConfig($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/views/home.html',
        controller: 'HomeController',
        controllerAs: 'vm',
        publicRoute: true,
      })
      .when('/login', {
        templateUrl: 'app/views/login.html',
        controller: 'LoginController',
        controllerAs: 'vm',
        publicRoute: true,
      })
      .when('/register', {
        templateUrl: 'app/views/register.html',
        controller: 'RegisterController',
        controllerAs: 'vm',
        publicRoute: true,
      })
      .when('/products', {
        templateUrl: 'app/views/product-list.html',
        controller: 'ProductListController',
        controllerAs: 'vm',
        publicRoute: true,
        reloadOnSearch: true,
      })
      .when('/products/:id', {
        templateUrl: 'app/views/product-detail.html',
        controller: 'ProductDetailController',
        controllerAs: 'vm',
        publicRoute: true,
      })
      .when('/cart', {
        templateUrl: 'app/views/cart.html',
        controller: 'CartController',
        controllerAs: 'vm',
      })
      .when('/checkout', {
        templateUrl: 'app/views/checkout.html',
        controller: 'CheckoutController',
        controllerAs: 'vm',
      })
      .when('/orders', {
        templateUrl: 'app/views/orders.html',
        controller: 'OrdersController',
        controllerAs: 'vm',
      })
      .when('/orders/:id', {
        templateUrl: 'app/views/order-detail.html',
        controller: 'OrderDetailController',
        controllerAs: 'vm',
      })
      .when('/profile', {
        templateUrl: 'app/views/profile.html',
        controller: 'ProfileController',
        controllerAs: 'vm',
      })
      .otherwise({ redirectTo: '/' });

    $locationProvider.hashPrefix('!');
  }

  runBlock.$inject = ['$rootScope', '$location', 'AuthService'];
  function runBlock($rootScope, $location, AuthService) {
    // Route guard: browsing (home, product list/detail, login, register)
    // is public; cart, checkout, orders, and profile require a session.
    $rootScope.$on('$routeChangeStart', function (event, next) {
      var isPublic = next && next.$$route && next.$$route.publicRoute;
      if (!isPublic && !AuthService.isAuthenticated()) {
        $location.path('/login');
      }
    });
  }
})();
