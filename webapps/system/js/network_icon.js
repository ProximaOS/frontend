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

        // Retrieve the signal strength
        const signalStrength = this.networks[0].quality;

        // Convert signal strength to percentage
        const signalStrengthPercentage = signalStrength;

        this.iconElement.classList.remove('hidden');

        this.iconElement.dataset.icon = `wifi-${Math.round(signalStrengthPercentage / 25)}`;
      });

      clearTimeout(this.timer);
      this.timer = setTimeout(this.update, 1000);
    }
  };

  NetworkIcon.init();
})(window);
