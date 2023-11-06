!(function (exports) {
  'use strict';

  const UtilityTray = {
    element: document.getElementById('utility-tray'),
    wifiPanel: document.getElementById('utility-tray-wifi'),
    bluetoothPanel: document.getElementById('utility-tray-bluetooth'),
    wifiBackButton: document.getElementById('utility-tray-wifi-back-button'),
    bluetoothBackButton: document.getElementById('utility-tray-bluetooth-back-button'),

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
      { id: 'ringing', icon: 'bell' },
      { id: 'vibrate', icon: 'vibrate' },
      { id: 'muted', icon: 'bell-off' }
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

      this.wifiButton.addEventListener('contextmenu', this.handleWifiButtonHold.bind(this));
      this.bluetoothButton.addEventListener('contextmenu', this.handleBluetoothButtonHold.bind(this));
      this.wifiBackButton.addEventListener('click', this.handleWifiBackButton.bind(this));
      this.bluetoothBackButton.addEventListener('click', this.handleBluetoothBackButton.bind(this));

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

    handleWifiButtonHold: function () {
      Transitions.scale(this.wifiButton.parentElement, this.wifiPanel);
      this.element.classList.add('panel-open');
      this.wifiPanel.classList.add('visible');
    },

    handleWifiBackButton: function () {
      Transitions.scale(this.wifiPanel, this.wifiButton.parentElement);
      this.element.classList.remove('panel-open');
      this.wifiPanel.classList.remove('visible');
    },

    handleBluetoothButton: function () {
      this.bluetoothButton.parentElement.classList.toggle('enabled');
    },

    handleBluetoothButtonHold: function () {
      Transitions.scale(this.bluetoothButton.parentElement, this.bluetoothPanel);
      this.controlCenter.classList.add('hidden');
      this.bluetoothPanel.classList.add('visible');
    },

    handleBluetoothBackButton: function () {
      Transitions.scale(this.bluetoothPanel, this.bluetoothButton.parentElement);
      this.controlCenter.classList.remove('hidden');
      this.bluetoothPanel.classList.remove('visible');
    },

    handleCellularDataButton: function () {
      this.cellularDataButton.parentElement.classList.toggle('enabled');
    },

    handleAirplaneButton: function () {
      this.airplaneButton.parentElement.classList.toggle('enabled');
    },

    handleAudioButton: function () {
      this.audioIndex = (this.audioIndex - 1 + this.AUDIO_PROFILES.length) % this.AUDIO_PROFILES.length;
      this.audioButton.children[0].dataset.icon = this.AUDIO_PROFILES[this.audioIndex].icon;
      if (this.AUDIO_PROFILES[this.audioIndex].id !== 'muted') {
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
