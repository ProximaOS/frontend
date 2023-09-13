!(function (exports) {
  'use strict';

  const Account = {
    accountBanner: document.getElementById('account-banner'),
    accountAvatar: document.getElementById('account-avatar'),
    accountUsername: document.getElementById('account-username'),
    accountEmail: document.getElementById('account-email'),
    accountPhoneNumber: document.getElementById('account-phone-number'),

    init: function () {
      if ('OrchidServices' in window) {
        if (OrchidServices.isUserLoggedIn()) {
          OrchidServices.getWithUpdate(
            `profile/${OrchidServices.userId()}`,
            (data) => {
              this.accountBanner.src = data.banner_image || data.profile_picture;
              this.accountAvatar.src = data.profile_picture;
              this.accountUsername.textContent = data.username;
              this.accountEmail.textContent = data.email;
              this.accountPhoneNumber.textContent = data.phoneNumber;
            }
          );
        }
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => Account.init());
})(window);
