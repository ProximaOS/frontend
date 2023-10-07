!(function (exports) {
  'use strict';

  const LoginUi = {
    element: document.getElementById('login-ui'),
    browser: document.getElementById('login-ui-browser'),

    init: function () {
      window.addEventListener('requestlogin', this.handleLoginRequest.bind(this));
    },

    handleLoginRequest: function (event) {
      event.preventDefault();

      const detail = event.detail;
      this.element.classList.add('visible');
      this.browser.src = `/frp/${detail.type}.html`;
    }
  };

  LoginUi.init();
})(window);
