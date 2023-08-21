!(function (exports) {
  'use strict';

  const UtilityTray = {
    wifiButton: document.getElementById('quick-settings-wifi'),
    bluetoothButton: document.getElementById('quick-settings-bluetooth'),
    cellularDataButton: document.getElementById('quick-settings-cellular-data'),
    airplaneButton: document.getElementById('quick-settings-airplane'),
    audioButton: document.getElementById('quick-settings-audio'),
    screenCaptureButton: document.getElementById('quick-settings-screen-capture'),
    flashlightButton: document.getElementById('quick-settings-flashlight'),

    AUDIO_PROFILES: [
      'ringing',
      'vibrate',
      'muted'
    ],

    audioIndex: 0,

    init: function () {
      this.wifiButton.addEventListener('click', this.handleWifiButton.bind(this));
      this.bluetoothButton.addEventListener('click', this.handleBluetoothButton.bind(this));
      this.cellularDataButton.addEventListener('click', this.handleCellularDataButton.bind(this));
      this.airplaneButton.addEventListener('click', this.handleAirplaneButton.bind(this));
      this.audioButton.addEventListener('click', this.handleAudioButton.bind(this));
      this.screenCaptureButton.addEventListener('click', this.handleScreenCaptureButton.bind(this));
      this.flashlightButton.addEventListener('click', this.handleFlashlightButton.bind(this));
    },

    handleWifiButton: function () {
      this.wifiButton.parentElement.classList.toggle('enabled');
    },

    handleBluetoothButton: function () {
      this.bluetoothButton.parentElement.classList.toggle('enabled');
    },

    handleCellularDataButton: function () {
      this.cellularDataButton.parentElement.classList.toggle('enabled');
    },

    handleAirplaneButton: function () {
      this.airplaneButton.parentElement.classList.toggle('enabled');
    },

    handleAudioButton: function () {
      this.audioIndex = (this.audioIndex - 1 + this.AUDIO_PROFILES.length) % this.AUDIO_PROFILES.length;
      this.audioButton.className = this.AUDIO_PROFILES[this.audioIndex];
      if (this.AUDIO_PROFILES[this.audioIndex] !== 'muted') {
        this.audioButton.parentElement.classList.add('enabled');
      } else {
        this.audioButton.parentElement.classList.remove('enabled');
      }
    },

    handleScreenCaptureButton: function () {
      this.screenCaptureButton.parentElement.classList.toggle('enabled');
    },

    handleFlashlightButton: function () {
      this.flashlightButton.parentElement.classList.toggle('enabled');
    }
  };

  UtilityTray.init();
})(window);
