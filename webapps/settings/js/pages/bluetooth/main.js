!(function (exports) {
  'use strict';

  window.addEventListener('DOMContentLoaded', () => {
    const availableDevicesList = document.getElementById('available-devices');

    async function searchDevices () {
      try {
        const devices = await BluetoothManager.scan({
          acceptAllDevices: true
        });

        devices.forEach((device) => {
          const listItem = document.createElement('li');
          listItem.dataset.icon = 'desktop';
          availableDevicesList.appendChild(listItem);

          const listName = document.createElement('p');
          listName.textContent = device.name;
          listItem.appendChild(listName);

          const listManufacturer = document.createElement('p');
          listManufacturer.textContent = device.manufacturerName || '';
          listItem.appendChild(listManufacturer);
        });
      } catch (error) {
        console.error('Error fetching available devices:', error);
      }
    }
    searchDevices();

    const bluetoothSwitch = document.getElementById('bluetooth-switch');
    bluetoothSwitch.addEventListener('change', () => {
      const isChecked = bluetoothSwitch.checked;
      // Handle Bluetooth switch change event here
      console.log('Bluetooth switch state changed:', isChecked);
    });

    const bluetoothReload = document.getElementById('bluetooth-reload-button');
    bluetoothReload.addEventListener('click', searchDevices);
  });
})(window);
