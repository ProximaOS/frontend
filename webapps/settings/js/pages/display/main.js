!(function (exports) {
  'use strict';

  const Display = {
    brightnessSlider: document.getElementById('display-brightness-slider'),
    AutoBrightnessSwitch: document.getElementById('display-auto-brightness-switch'),
    darkModeSwitch: document.getElementById('display-dark-mode-switch'),
    warmColorsSwitch: document.getElementById('display-warm-colors-switch'),
    readerModeSwitch: document.getElementById('display-reader-mode-switch'),
    redLightPointSwitch: document.getElementById('display-red-light-point-switch'),

    init: function () {
      this.brightnessSlider.min = 0;
      this.brightnessSlider.max = 100;
      this.brightnessSlider.addEventListener('input', this.handleBrightnessSlider.bind(this));
      window.Settings.getValue('video.brightness').then((data) => {
        this.brightnessSlider.value = data;
      });

      this.darkModeSwitch.addEventListener('change', this.handleDarkModeSwitch.bind(this));
      window.Settings.getValue('video.dark_mode.enabled').then((data) => {
        this.darkModeSwitch.checked = data;
      });

      this.warmColorsSwitch.addEventListener('change', this.handleWarmColorsSwitch.bind(this));
      window.Settings.getValue('video.warm_colors.enabled').then((data) => {
        this.warmColorsSwitch.checked = data;
      });

      this.readerModeSwitch.addEventListener('change', this.handleReaderModeSwitch.bind(this));
      window.Settings.getValue('video.reader_mode.enabled').then((data) => {
        this.readerModeSwitch.checked = data;
      });

      this.redLightPointSwitch.addEventListener('change', this.handleRedLightPointSwitch.bind(this));
      window.Settings.getValue('video.red_light_point.enabled').then((data) => {
        this.redLightPointSwitch.checked = data;
      });
    },

    handleBrightnessSlider: function () {
      const value = parseInt(this.brightnessSlider.value);
      window.Settings.setValue('video.brightness', value);
    },

    handleDarkModeSwitch: function () {
      const value = this.darkModeSwitch.checked;
      window.Settings.setValue('video.dark_mode.enabled', value);
    },

    handleWarmColorsSwitch: function () {
      const value = this.warmColorsSwitch.checked;
      window.Settings.setValue('video.warm_colors.enabled', value);
    },

    handleReaderModeSwitch: function () {
      const value = this.readerModeSwitch.checked;
      window.Settings.setValue('video.reader_mode.enabled', value);
    },

    handleRedLightPointSwitch: function () {
      const value = this.redLightPointSwitch.checked;
      window.Settings.setValue('video.red_light_point.enabled', value);
    }
  };

  Display.init();
})(window);
