const BatteryIcon = {
  iconElement: document.getElementById("statusbar-battery"),

  init: function () {
    navigator.getBattery().then((battery) => {
      this.battery = battery;

      this.iconElement.classList.remove("hidden");

      var level = battery.level;
      var charging = battery.charging;
      if (charging) {
        this.iconElement.dataset.icon = `battery-charging-${Math.round(level * 10) * 10}`;
      } else {
        this.iconElement.dataset.icon = `battery-${Math.round(level * 10) * 10}`;
      }

      ['chargingchange', 'dischargingchange', 'levelchange'].forEach(event => {
        battery.addEventListener(event, () => {
          level = battery.level;
          charging = battery.isCharging;
          if (charging) {
            this.iconElement.dataset.icon = `battery-charging-${Math.round(level * 10) * 10}`;
          } else {
            this.iconElement.dataset.icon = `battery-${Math.round(level * 10) * 10}`;
          }
        });
      });
    });
  }
}

BatteryIcon.init();
