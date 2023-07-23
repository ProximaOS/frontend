const BatteryIcon = {
  iconElement: document.getElementById("statusbar-battery"),

  init: function () {
    navigator.getBattery().then((battery) => {
      this.battery = battery;

      this.iconElement.classList.remove("hidden");

      var level = battery.level;
      var charging = battery.charging;
      this.iconElement.dataset.icon = `battery-${Math.round(level * 10) * 10}`;
      if (charging) {
        this.iconElement.classList.add('charging');
      } else {
        this.iconElement.classList.remove('charging');
      }

      ['chargingchange', 'dischargingchange', 'levelchange'].forEach(event => {
        battery.addEventListener(event, () => {
          level = battery.level;
          charging = battery.isCharging;
          this.iconElement.dataset.icon = `battery-${Math.round(level * 10) * 10}`;
          if (charging) {
            this.iconElement.classList.add('charging');
          } else {
            this.iconElement.classList.remove('charging');
          }
        });
      });
    });
  }
}

BatteryIcon.init();
