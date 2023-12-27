!(function (exports) {
  'use strict';

  const Root = {
    accountButton: document.getElementById('account-button'),
    accountButtonAvatar: document.getElementById('account-button-avatar'),
    accountButtonUsername: document.getElementById('account-button-username'),
    accountButtonContact: document.getElementById('account-button-contact'),
    loginButton: document.getElementById('login-button'),

    init: async function () {
      if (await _os.isLoggedIn()) {
        this.loginButton.style.display = 'none';
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
        this.loginButton.style.display = '';
        this.accountButton.style.display = 'none';
      }

      this.loginButton.addEventListener('click', this.handleLoginButton.bind(this));
    },

    handleLoginButton: function (event) {
      IPC.send('requestlogin', {
        type: 'login'
      });
    }
  };

  window.addEventListener('orchid-services-ready', () => {
    Root.init();
  });
})(window);
