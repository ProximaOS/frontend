!(function (exports) {
  'use strict';

  const Login = {
    emailInput: document.getElementById('login-email'),
    passwordInput: document.getElementById('login-password'),
    confirmButton: document.getElementById('login-confirm-button'),

    init: async function () {
      this.confirmButton.addEventListener('click', this.handleConfirmButton.bind(this));
    },

    handleConfirmButton: function () {
      if ('OrchidServices' in window) {
        OrchidServices.auth.login(this.emailInput.value, this.passwordInput.value);
      }
    }
  };

  Login.init();
})(window);
