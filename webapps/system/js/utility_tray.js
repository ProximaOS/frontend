!(function (exports) {
  'use strict';

  const UtilityTray = {
    element: document.getElementById('utility-tray'),

    titlebar: document.querySelector('#utility-tray .titlebar'),
    controlCenter: document.getElementById('control-center'),
    notifications: document.getElementById('notifications'),

    wifiButton: document.getElementById('quick-settings-wifi'),
    bluetoothButton: document.getElementById('quick-settings-bluetooth'),
    cellularDataButton: document.getElementById('quick-settings-cellular-data'),
    airplaneButton: document.getElementById('quick-settings-airplane'),
    audioButton: document.getElementById('quick-settings-audio'),
    screenCaptureButton: document.getElementById('quick-settings-screen-capture'),
    flashlightButton: document.getElementById('quick-settings-flashlight'),

    brightnessSlider: document.getElementById('brightness-slider'),

    AUDIO_PROFILES: [
      'ringing',
      'vibrate',
      'muted'
    ],

    audioIndex: 0,

    init: function () {
      this.controlCenter.addEventListener('scroll', this.handleScroll.bind(this));
      this.notifications.addEventListener('scroll', this.handleScroll.bind(this));

      this.wifiButton.addEventListener('click', this.handleWifiButton.bind(this));
      this.bluetoothButton.addEventListener('click', this.handleBluetoothButton.bind(this));
      this.cellularDataButton.addEventListener('click', this.handleCellularDataButton.bind(this));
      this.airplaneButton.addEventListener('click', this.handleAirplaneButton.bind(this));
      this.audioButton.addEventListener('click', this.handleAudioButton.bind(this));
      this.screenCaptureButton.addEventListener('click', this.handleScreenCaptureButton.bind(this));
      this.flashlightButton.addEventListener('click', this.handleFlashlightButton.bind(this));

      this.brightnessSlider.addEventListener('pointerdown', this.handleBrightnessSliderDown.bind(this));
      this.brightnessSlider.addEventListener('pointerup', this.handleBrightnessSliderUp.bind(this));
    },

    handleScroll: function (event) {
      const scrollPosition = event.target.scrollTop;
      let progress = scrollPosition / 80;
      if (progress >= 1) {
        progress = 1;
      }

      this.titlebar.style.setProperty('--scroll-progress', progress);
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
    },

    handleBrightnessSliderDown: function () {
      this.element.classList.add('brightness-changing');
    },

    handleBrightnessSliderUp: function () {
      this.element.classList.remove('brightness-changing');
    }
  };

  UtilityTray.init();
})(window);
