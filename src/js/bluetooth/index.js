!(function () {
  'use strict';

  module.exports = {
    devices: [],

    scan: function (duration = 10) {
      const noble = require('noble');

      return new Promise((resolve, reject) => {
        this.devices = [];

        noble.on('stateChange', (state) => {
          if (state === 'poweredOn') {
            noble.startScanning();
            setTimeout(() => {
              noble.stopScanning();
              resolve(this.devices);
            }, duration * 1000);
          } else {
            noble.stopScanning();
            reject(new Error('Bluetooth is not powered on.'));
          }
        });

        noble.on('discover', (peripheral) => {
          const device = {
            id: peripheral.id,
            name: peripheral.advertisement.localName || 'Unknown Device',
            rssi: peripheral.rssi,
            address: peripheral.address,
            advertisement: peripheral.advertisement
          };
          this.devices.push(device);
        });
      });
    },

    connect: function (deviceId) {
      const noble = require('noble');

      return new Promise((resolve, reject) => {
        const device = this.devices.find((dev) => dev.id === deviceId);

        if (!device) {
          reject(new Error('Device not found.'));
          return;
        }

        const peripheral = noble._peripherals[device.id];

        if (!peripheral) {
          reject(new Error('Peripheral not found.'));
          return;
        }

        peripheral.connect((error) => {
          if (error) {
            reject(error);
          } else {
            resolve(device);
          }
        });
      });
    },

    disconnect: function (deviceId) {
      const noble = require('noble');

      return new Promise((resolve, reject) => {
        const device = this.devices.find((dev) => dev.id === deviceId);

        if (!device) {
          reject(new Error('Device not found.'));
          return;
        }

        const peripheral = noble._peripherals[device.id];

        if (!peripheral) {
          reject(new Error('Peripheral not found.'));
          return;
        }

        peripheral.disconnect((error) => {
          if (error) {
            reject(error);
          } else {
            resolve(device);
          }
        });
      });
    },

    enable: function () {
      const noble = require('noble');

      return new Promise((resolve, reject) => {
        noble.on('stateChange', (state) => {
          if (state === 'poweredOn') {
            resolve();
          } else {
            reject(new Error('Bluetooth could not be enabled.'));
          }
        });

        noble.state = 'poweredOn';
      });
    },

    disable: function () {
      const noble = require('noble');

      return new Promise((resolve, reject) => {
        noble.on('stateChange', (state) => {
          if (state === 'poweredOff') {
            resolve();
          } else {
            reject(new Error('Bluetooth could not be disabled.'));
          }
        });

        noble.state = 'poweredOff';
      });
    }
  };
})();
