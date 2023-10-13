!(function (exports) {
  'use strict';

  const Root = {
    accountButton: document.getElementById('account-button'),
    accountButtonAvatar: document.getElementById('account-button-avatar'),
    accountButtonUsername: document.getElementById('account-button-username'),
    accountButtonContact: document.getElementById('account-button-contact'),

    init: async function () {
      if ('OrchidServices' in window) {
        if (await OrchidServices.isUserLoggedIn()) {
          this.accountButton.classList.add('visible');
          OrchidServices.getWithUpdate(
            `profile/${await OrchidServices.userId()}`,
            (data) => {
              this.accountButtonAvatar.src = data.profilePicture;
              this.accountButtonUsername.textContent = data.username;
              this.accountButtonContact.textContent = data.email;
            }
          );
        }
      }
    }
  };

  window.addEventListener('orchidservicesload', () => {
    Root.init();
  });
})(window);
