!(function (exports) {
  'use strict';

  const UtilityTray = {
    element: document.getElementById('utility-tray'),
    wifiPanel: document.getElementById('utility-tray-wifi'),
    bluetoothPanel: document.getElementById('utility-tray-bluetooth'),
    wifiBackButton: document.getElementById('utility-tray-wifi-back-button'),
    bluetoothBackButton: document.getElementById('utility-tray-bluetooth-back-button'),

    titlebar: document.querySelector('#utility-tray .titlebar'),
    grippyBar: document.querySelector('#utility-tray .grippy-bar'),
    controlCenter: document.getElementById('control-center'),
    quickSettings: document.getElementById('quick-settings'),
    quickSettingsGrid: document.getElementById('quick-settings-grid'),
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
    SOUND_NOTIFIER: new Audio('http://shared.localhost:8081/resources/notifications/notifier_orchid2.wav'),

    audioIndex: 0,
    isCollapsed: false,
    isDragging: false,
    startY: null,
    currentY: null,

    init: function () {
      this.controlCenter.addEventListener('scroll', this.handleScroll.bind(this));
      this.notifications.addEventListener('scroll', this.handleScroll.bind(this));

      this.quickSettings.addEventListener('mousedown', this.onPointerDown.bind(this));
      document.addEventListener('mousemove', this.onPointerMove.bind(this));
      document.addEventListener('mouseup', this.onPointerUp.bind(this));
      this.grippyBar.addEventListener('click', this.handleGrippyBar.bind(this));

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

      this.audioButton.classList.remove('ringing', 'vibrate', 'muted');
      this.audioButton.classList.add(this.AUDIO_PROFILES[this.audioIndex].id);
      this.audioButton.children[1].dataset.l10nId = 'quickSettings-audio-' + this.AUDIO_PROFILES[this.audioIndex].id;

      this.quickSettings.classList.add('collapsed');
    },

    handleScroll: function (event) {
      const scrollPosition = event.target.scrollTop;
      let progress = scrollPosition / 80;
      if (progress >= 1) {
        progress = 1;
      }

      this.titlebar.style.setProperty('--scroll-progress', progress);
    },

    onPointerDown: function (event) {
      this.isDragging = true;
      this.startY = event.clientY || event.touches[0].clientY;
      this.quickSettings.classList.add('dragging');
    },

    onPointerMove: function (event) {
      this.isDragging = true;
      this.currentY = event.clientY || event.touches[0].clientY;

      const movementY = this.currentY - this.startY;
      const progress = Math.min(1, Math.max(0, (movementY / window.innerHeight) * 5));

      this.quickSettings.style.setProperty('--quick-settings-motion-progress', progress);
    },

    onPointerUp: function (event) {
      this.isDragging = false;
      this.currentY = event.clientY || event.touches[0].clientY;

      const movementY = this.currentY - this.startY;
      const progress = Math.min(1, Math.max(0, (movementY / window.innerHeight) * 5));
      this.quickSettings.classList.remove('dragging');
    },

    handleGrippyBar: function () {
      this.quickSettings.classList.toggle('collapsed');
      this.isCollapsed = !this.isCollapsed;
      if (!this.isCollapsed) {
        const height = `${this.quickSettingsGrid.scrollHeight}px`;
        this.quickSettings.style.setProperty('--quick-settings-grid-height', height);
      }
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
      this.audioButton.classList.remove('ringing', 'vibrate', 'muted');
      this.audioButton.classList.add(this.AUDIO_PROFILES[this.audioIndex].id);
      if (this.AUDIO_PROFILES[this.audioIndex].id !== 'muted') {
        this.audioButton.parentElement.classList.add('enabled');
      } else {
        this.audioButton.parentElement.classList.remove('enabled');
      }

      if (navigator.hardwareConcurrency > 4) {
        if (navigator.deviceMemory >= 6) {
          this.audioButton.children[1].dataset.l10nId = null;
          Counter.increment(this.audioButton.children[1], L10n.get('quickSettings-audio-' + this.AUDIO_PROFILES[this.audioIndex].id));
        } else {
          this.audioButton.children[1].dataset.l10nId = 'quickSettings-audio-' + this.AUDIO_PROFILES[this.audioIndex].id;
        }
      } else {
        this.audioButton.children[1].dataset.l10nId = 'quickSettings-audio-' + this.AUDIO_PROFILES[this.audioIndex].id;
      }

      switch (this.AUDIO_PROFILES[this.audioIndex].id) {
        case 'ringing':
          this.SOUND_NOTIFIER.currentTime = 0;
          this.SOUND_NOTIFIER.play();
          break;

        case 'vibrate':
          navigator.vibrate(500);
          break;

        default:
          break;
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
