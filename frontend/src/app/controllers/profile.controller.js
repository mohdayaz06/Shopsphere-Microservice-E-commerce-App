(function () {
  'use strict';

  angular.module('shopSphereApp').controller('ProfileController', ProfileController);

  ProfileController.$inject = ['AuthService', 'NotificationService'];
  function ProfileController(AuthService, NotificationService) {
    var vm = this;

    vm.profile = { fullName: '', phone: '', email: '' };
    vm.addresses = [];
    vm.newAddress = { label: 'Home', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false };

    vm.isLoading = true;
    vm.isSavingProfile = false;
    vm.isAddingAddress = false;
    vm.profileError = '';
    vm.profileMessage = '';

    vm.saveProfile = saveProfile;
    vm.addAddress = addAddress;
    vm.deleteAddress = deleteAddress;

    activate();

    function activate() {
      AuthService.fetchProfile()
        .then(function (user) {
          vm.profile = { fullName: user.full_name, phone: user.phone, email: user.email };
        })
        .catch(function () {
          vm.profileError = 'Could not load your profile.';
        })
        .finally(function () {
          vm.isLoading = false;
        });

      loadAddresses();
    }

    function loadAddresses() {
      AuthService.listAddresses().then(function (addresses) {
        vm.addresses = addresses;
      });
    }

    function saveProfile(profileForm) {
      if (profileForm.$invalid) return;

      vm.isSavingProfile = true;
      vm.profileMessage = '';
      vm.profileError = '';

      AuthService.updateProfile({ fullName: vm.profile.fullName, phone: vm.profile.phone })
        .then(function () {
          vm.profileMessage = 'Profile updated successfully.';
          NotificationService.success('Your profile has been updated.');
        })
        .catch(function (err) {
          vm.profileError = (err.data && err.data.message) || 'Failed to update profile.';
        })
        .finally(function () {
          vm.isSavingProfile = false;
        });
    }

    function addAddress(addressForm) {
      if (addressForm.$invalid) return;

      vm.isAddingAddress = true;
      AuthService.addAddress(vm.newAddress)
        .then(function () {
          vm.newAddress = { label: 'Home', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false };
          addressForm.$setPristine();
          addressForm.$setUntouched();
          NotificationService.success('Address added.');
          loadAddresses();
        })
        .catch(function (err) {
          NotificationService.error((err.data && err.data.message) || 'Could not add this address.');
        })
        .finally(function () {
          vm.isAddingAddress = false;
        });
    }

    function deleteAddress(address) {
      AuthService.deleteAddress(address.id)
        .then(function () {
          NotificationService.success('Address removed.');
          loadAddresses();
        })
        .catch(function (err) {
          NotificationService.error((err.data && err.data.message) || 'Could not remove this address.');
        });
    }
  }
})();
