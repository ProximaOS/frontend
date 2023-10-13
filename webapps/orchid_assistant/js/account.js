!(function (exports) {
  'use strict';

  const Account = {
    init: async function () {
      if ('OrchidServices' in window) {
        if (await OrchidServices.isUserLoggedIn()) {
          OrchidServices.getWithUpdate(
            `profile/${await OrchidServices.userId()}`,
            (data) => {
              chatbot.user = data;
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
