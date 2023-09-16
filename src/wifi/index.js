!(function (exports) {
  'use strict';

  const wifi = require('node-wifi');

  wifi.init({
    iface: 'wlan0'
  });

  module.exports = {
    isEnabled: false,
    scan: () => {
      return new Promise((resolve, reject) => {
        // Code to check Wi-Fi status and return the result
        wifi.scan((error, networks) => {
          if (error) {
            console.error(error);
          }
          resolve(networks);
        });
      });
    },
    getCurrentConnections: () => {
      return new Promise((resolve, reject) => {
        // Code to check Wi-Fi status and return the result
        wifi.getCurrentConnections((error, currentConnections) => {
          if (error) {
            console.error(error);
          }
          resolve(currentConnections);
        });
      });
    },
    enable: () => {
      // Code to enable wifimanager
      this.isEnabled = true;
    },
    disable: () => {
      // Code to disable wifimanager
      this.isEnabled = false;
    },
    deleteConnection: (ssid) => {
      // Code to delete a network
      wifi.deleteConnection({ ssid }, (error) => {
        if (error) {
          console.error(error);
        }
      });
    }
  };
})(window);
