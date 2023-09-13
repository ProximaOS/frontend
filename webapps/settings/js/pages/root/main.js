!(function (exports) {
  'use strict';

  const Root = {
    accountButton: document.getElementById('account-button'),
    accountButtonAvatar: document.getElementById('account-button-avatar'),
    accountButtonUsername: document.getElementById('account-button-username'),
    accountButtonContact: document.getElementById('account-button-contact'),

    init: function () {
      if ('OrchidServices' in window) {
        if (OrchidServices.isUserLoggedIn()) {
          this.accountButton.classList.add('visible');
          OrchidServices.getWithUpdate(
            `profile/${OrchidServices.userId()}`,
            (data) => {
              this.accountButtonAvatar.src = data.profile_picture;
              this.accountButtonUsername.textContent = data.username;
              this.accountButtonContact.textContent = data.email;
            }
          );
        }
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => Root.init());
})(window);
