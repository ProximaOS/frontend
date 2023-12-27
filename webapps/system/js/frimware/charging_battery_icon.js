!(function (exports) {
  'use strict';

  const ChargingBatteryIcon = {
    iconElement: document.getElementById('charging-battery-icon'),

    init: function () {
      navigator.getBattery().then((battery) => {
        this.battery = battery;

        let level = battery.level;
        let charging = battery.charging;
        if (charging) {
          this.iconElement.dataset.icon = `battery-charging-${Math.round(level * 10) * 10}`;
        } else {
          this.iconElement.dataset.icon = `battery-${Math.round(level * 10) * 10}`;
        }

        ['chargingchange', 'levelchange'].forEach((event) => {
          battery.addEventListener(event, () => {
            level = battery.level;
            charging = battery.charging;
            if (charging) {
              this.iconElement.dataset.icon = `battery-charging-${Math.round(level * 10) * 10}`;
            } else {
              this.iconElement.dataset.icon = `battery-${Math.round(level * 10) * 10}`;
            }
          });
        });
      });
    }
  };

  ChargingBatteryIcon.init();
})(window);
