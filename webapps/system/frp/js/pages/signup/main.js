!(function (exports) {
  'use strict';

  const Signup = {
    usernameInput: document.getElementById('signup-username'),
    handleNameInput: document.getElementById('signup-handle-name'),
    emailInput: document.getElementById('signup-email'),
    passwordInput: document.getElementById('signup-password'),
    passwordConfirmInput: document.getElementById('signup-password-confirm'),
    birthDateInput: document.getElementById('signup-birth-date'),
    confirmButton: document.getElementById('signup-confirm-button'),

    init: async function () {
      this.confirmButton.addEventListener('click', this.handleConfirmButton.bind(this));
    },

    handleConfirmButton: function () {
      if (this.passwordInput.value !== this.passwordConfirmInput.value) {
        return;
      }

      if ('OrchidServices' in window) {
        OrchidServices.auth.signUp({
          username: this.usernameInput.value,
          handleName: this.handleNameInput.value,
          email: this.emailInput.value,
          password: this.passwordInput.value
          birthDate: this.birthDateInput.value
        });
      }
    }
  };

  Signup.init();
})(window);
