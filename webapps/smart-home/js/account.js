!(function (exports) {
  'use strict';

  const Account = {
    accountButton: document.getElementById('account-button'),
    accountButtonAvatar: document.getElementById('account-button-avatar'),

    init: async function () {
      if ('OrchidServices' in window) {
        if (await OrchidServices.isUserLoggedIn()) {
          OrchidServices.getWithUpdate(
            `profile/${await OrchidServices.userId()}`,
            (data) => {
              this.accountButtonAvatar.src = data.profile_picture;
            }
          );
        }
      }
    }
  };

  Account.init();
  window.addEventListener('orchidservicesload', () => {
    Account.init();
  });
})(window);
