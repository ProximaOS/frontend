!(function (exports) {
  'use strict';

  const Wifi = {
    toggleSwitch: document.getElementById('wifi-switch'),
    reloadButton: document.getElementById('wifi-reload-button'),
    availableNetworksList: document.getElementById('available-networks'),

    init: function () {
      // Add event listener to the Wi-Fi switch
      this.toggleSwitch.addEventListener(
        'change',
        this.handleToggleSwitch.bind(this)
      );

      // Add event listener to the reload button
      this.reloadButton.addEventListener(
        'click',
        this.searchNetworks.bind(this)
      );

      this.searchNetworks();
    },

    handleToggleSwitch: function () {
      // ...
    },

    searchNetworks: async function () {
      try {
        const networks = await _session.wifiManager.scan();
        this.availableNetworksList.innerHTML = '';
        networks.forEach((network) => {
          // Convert signal strength to percentage
          const signalStrengthPercentage = network.quality;

          const listItem = document.createElement('li');
          listItem.dataset.icon = `wifi-${Math.round(
            signalStrengthPercentage / 25
          )}`;
          this.availableNetworksList.appendChild(listItem);

          const listName = document.createElement('p');
          listName.textContent = network.ssid;
          listItem.appendChild(listName);

          const listSecurity = document.createElement('p');
          listSecurity.textContent = network.security;
          listItem.appendChild(listSecurity);
        });
      } catch (error) {
        console.error('Error fetching available networks:', error);
      }
    }
  };

  Wifi.init();
})(window);
