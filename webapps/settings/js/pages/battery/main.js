!(function (exports) {
  'use strict';

  window.addEventListener('DOMContentLoaded', () => {
    const batteryPercentage = document.getElementById('battery-percentage');
    const batteryChargeState = document.getElementById('battery-charge-state');

    navigator.getBattery().then((battery) => {
      let level = parseInt(battery.level * 100);
      let charging = battery.charging;
      batteryPercentage.dataset.l10nArgs = `{"n":"${level}"}`;
      batteryChargeState.dataset.l10nId = charging
        ? 'battery-charging'
        : 'battery-discharging';
      batteryChargeState.dataset.l10nArgs = `{"time":"${
        charging ? battery.chargingTime : battery.dischargingTime
      }"}`;

      [
        'chargingchange',
        'chargingtimechange',
        'dischargingtimechange',
        'levelchange'
      ].forEach((event) => {
        battery.addEventListener(event, () => {
          level = parseInt(battery.level * 100);
          charging = battery.charging;
          batteryPercentage.dataset.l10nArgs = `{"n":"${level}"}`;
          batteryChargeState.dataset.l10nId = charging
            ? 'battery-charging'
            : 'battery-discharging';
          batteryChargeState.dataset.l10nArgs = `{"time":"${
            charging ? battery.chargingTime : battery.dischargingTime
          }"}`;
        });
      });
    });
  });
})(window);
