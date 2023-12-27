!(function (exports) {
  'use strict';

  const NetworkIcon = {
    iconElement: document.getElementById('statusbar-wifi'),

    init: function () {
      this.update();
    },

    update: function () {
      WifiManager.getCurrentConnections().then((networks) => {
        this.networks = networks;

        const signalStrength = this.networks[0].quality;
        const signalStrengthPercentage = signalStrength;

        this.iconElement.classList.remove('hidden');
        this.iconElement.dataset.icon = `wifi-${Math.round(signalStrengthPercentage / 25)}`;

        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(this.update.bind(this), 1000);
      }).catch((error) => {
        console.error(error);
        this.iconElement.classList.add('hidden');
      });
    }
  };

  NetworkIcon.init();
})(window);
