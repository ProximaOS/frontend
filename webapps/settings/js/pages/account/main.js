!(function (exports) {
  'use strict';

  const Account = {
    accountBanner: document.getElementById('account-banner'),
    accountAvatar: document.getElementById('account-avatar'),
    accountUsername: document.getElementById('account-username'),
    accountEmail: document.getElementById('account-email'),
    accountPhoneNumber: document.getElementById('account-phone-number'),

    init: async function () {
      if ('OrchidServices' in window) {
        if (await OrchidServices.isUserLoggedIn()) {
          OrchidServices.getWithUpdate(
            `profile/${await OrchidServices.userId()}`,
            (data) => {
              this.accountBanner.src = data.banner_image || data.profile_picture;
              this.accountAvatar.src = data.profile_picture;
              this.accountUsername.textContent = data.username;
              this.accountEmail.textContent = data.email;
              this.accountPhoneNumber.textContent = data.phone_number;
            }
          );
        }
      }
    }
  };

  window.addEventListener('load', () => {
    setTimeout(() => {
      Account.init();
    }, 1000);
  });
})(window);
