!(function (exports) {
  'use strict';

  const BatteryIcon = {
    iconElement: document.getElementById('listItem-battery'),

    init: function () {
      navigator.getBattery().then((battery) => {
        this.battery = battery;

        let level = battery.level;
        let charging = battery.charging;
        this.iconElement.dataset.icon = `battery-${
          Math.round(level * 10) * 10
        }`;
        if (charging) {
          this.iconElement.classList.add('charging');
        } else {
          this.iconElement.classList.remove('charging');
        }

        ['chargingchange', 'levelchange'].forEach((event) => {
          battery.addEventListener(event, () => {
            level = battery.level;
            charging = battery.charging;
            this.iconElement.dataset.icon = `battery-${
              Math.round(level * 10) * 10
            }`;
            if (charging) {
              this.iconElement.classList.add('charging');
            } else {
              this.iconElement.classList.remove('charging');
            }
          });
        });
      });
    }
  };

  BatteryIcon.init();
})(window);
