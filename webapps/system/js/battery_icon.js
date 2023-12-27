!(function (exports) {
  'use strict';

  const BatteryIcon = {
    iconElement: document.getElementById('statusbar-battery'),
    percentageElement: document.getElementById('statusbar-battery-percentage'),

    init: function () {
      navigator.getBattery().then((battery) => {
        this.battery = battery;

        this.iconElement.classList.remove('hidden');

        let level = battery.level;
        let charging = battery.charging;
        if (charging) {
          this.iconElement.dataset.icon = `battery-charging-${Math.round(level * 10) * 10}`;
        } else {
          this.iconElement.dataset.icon = `battery-${Math.round(level * 10) * 10}`;
        }
        this.percentageElement.dataset.l10nId = 'batteryStatusPercentage';
        this.percentageElement.dataset.l10nArgs = `{"value":"${Math.round(level * 100)}"}`;
        document.addEventListener('localized', () => {
          this.percentageElement.style.setProperty('--hide-margin', `-${this.percentageElement.scrollWidth / 2}px`);
        });

        ['chargingchange', 'levelchange'].forEach((event) => {
          battery.addEventListener(event, () => {
            level = battery.level;
            charging = battery.charging;
            if (charging) {
              this.iconElement.dataset.icon = `battery-charging-${Math.round(level * 10) * 10}`;
            } else {
              this.iconElement.dataset.icon = `battery-${Math.round(level * 10) * 10}`;
            }
            this.percentageElement.dataset.l10nArgs = `{"value":"${Math.round(level * 100)}"}`;
            document.addEventListener('localized', () => {
              this.percentageElement.style.setProperty('--hide-margin', `-${this.percentageElement.scrollWidth / 2}px`);
            });
          });
        });
      });
    }
  };

  BatteryIcon.init();
})(window);
