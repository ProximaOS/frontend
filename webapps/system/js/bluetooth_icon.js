!(function (exports) {
  'use strict';

  const BluetoothIcon = {
    iconElement: document.getElementById('statusbar-bluetooth'),

    init: function () {
      this.update();
    },

    update: function () {
      BluetoothManager.scan((data, error) => {
        if (error) {
          console.error(error);
          this.iconElement.classList.remove('hidden');
          return;
        }

        const connectedBluetooth = networks.find(
          (network) => network.state === 'connected'
        );

        const bluetoothEnabled = connectedBluetooth || false;

        if (bluetoothEnabled) {
          this.iconElement.classList.remove('hidden');
        } else {
          this.iconElement.classList.add('hidden');
        }
      });

      clearTimeout(this.timer);
      this.timer = setTimeout(this.update, 1000);
    }
  };

  BluetoothIcon.init();
})(window);
