!(function (exports) {
  'use strict';

  const Root = {
    accountButton: document.getElementById('account-button'),
    accountButtonAvatar: document.getElementById('account-button-avatar'),
    accountButtonUsername: document.getElementById('account-button-username'),
    accountButtonContact: document.getElementById('account-button-contact'),

    init: async function () {
      if (await _os.isLoggedIn()) {
        this.accountButton.style.display = '';
        _os.auth.getLiveAvatar(null, (data) => {
          this.accountButtonAvatar.src = data;
        });
        _os.auth.getUsername().then((data) => {
          this.accountButtonUsername.textContent = data;
        });
        _os.auth.getHandleName().then((data) => {
          this.accountButtonContact.textContent = `@${data}`;
        });
      } else {
        this.accountButton.style.display = 'none';
      }
    }
  };

  window.addEventListener('orchid-services-ready', () => {
    Root.init();
  });
})(window);
