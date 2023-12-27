!(function (exports) {
  'use strict';

  const Account = {
    init: function () {
      window.addEventListener('orchidservicesload', this.handleServicesLoad.bind(this));
    },

    handleServicesLoad: async function () {
      if (await OrchidServices.isUserLoggedIn()) {
        OrchidServices.getWithUpdate(
          `profile/${await OrchidServices.userId()}`,
          (data) => {
            chatbot.user = data;
          }
        );
      }
      window.removeEventListener('orchidservicesload', this.handleServicesLoad.bind(this));
    }
  };

  Account.init();
})(window);
