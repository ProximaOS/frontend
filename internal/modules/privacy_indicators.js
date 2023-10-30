!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const PrivacyIndicators = {
    init: function () {
      setInterval(() => {
        this.handleDeviceChange();
      }, 1000);
      // navigator.mediaDevices.addEventListener('devicechange', this.handleDeviceChange.bind(this));
    },

    handleDeviceChange: function () {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const activeDevices = devices.filter(device => device.deviceId !== '');
          const activeDeviceTypes = activeDevices.map(device => device.kind);

          if (activeDeviceTypes.includes('audioinput') && activeDeviceTypes.includes('videoinput')) {
            ipcRenderer.send('mediadevicechange', {
              kind: 'video'
            });
          } else if (activeDeviceTypes.includes('audioinput')) {
            ipcRenderer.send('mediadevicechange', {
              kind: 'microphone'
            });
          } else if (activeDeviceTypes.includes('videoinput')) {
            ipcRenderer.send('mediadevicechange', {
              kind: 'camera'
            });
          } else {
            ipcRenderer.send('mediadevicechange', {
              kind: 'none'
            });
          }
        })
        .catch(error => {
          console.error('Error checking media devices status:', error);
        });
    }
  };

  // PrivacyIndicators.init();
})(window);
