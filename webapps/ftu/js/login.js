!(function (exports) {
  'use strict';

  const Login = {
    loginButton: document.getElementById('login-button'),

    init: function () {
      this.loginButton.addEventListener('click', this.handleLoginButtonClick.bind(this));
    },

    handleLoginButtonClick: function () {
      IPC.send('requestlogin', {
        type: 'login'
      });
    }
  };

  Login.init();
})(window);
