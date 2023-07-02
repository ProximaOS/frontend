const NetworkIcon = {
  iconElement: document.getElementById("statusbar-network"),

  init: function () {
    this.update();
  },

  update: function () {
    si.wifiNetworks((networks, error) => {
      if (error) {
        console.error(error);

        this.iconElement.classList.add("hidden");
      } else {
        this.networks = networks;

        // Find the connected network
        const connectedNetwork = networks.find(
          (network) => network.state === "connected"
        ) || networks[0];

        if (connectedNetwork) {
          // Retrieve the signal strength
          const signalStrength = connectedNetwork.quality;

          // Convert signal strength to percentage
          const signalStrengthPercentage = signalStrength;

          console.log(
            "Signal Strength:",
            signalStrengthPercentage.toFixed(2) + "%"
          );

          this.iconElement.classList.remove("hidden");

          this.iconElement.dataset.icon = `wifi-${Math.round(
            signalStrengthPercentage / 25
          )}`;
        }
      }
    });

    clearTimeout(this.timer);
    this.timer = setTimeout(this.update, 1000);
  },
};

NetworkIcon.init();
