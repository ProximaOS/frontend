!(function (exports) {
  'use strict';

  const Display = {
    brightnessSlider: document.getElementById('display-brightness-slider'),
    AutoBrightnessSwitch: document.getElementById('display-autoBrightness-switch'),
    darkModeSwitch: document.getElementById('display-darkMode-switch'),
    warmColorsSwitch: document.getElementById('display-warmColors-switch'),
    eBookModeSwitch: document.getElementById('display-eBook-switch'),

    init: function () {
      this.brightnessSlider.min = 0;
      this.brightnessSlider.max = 100;
      this.brightnessSlider.addEventListener('change', this.handleBrightnessSlider.bind(this));
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

      this.eBookModeSwitch.addEventListener('change', this.handleEBookModeSwitch.bind(this));
      window.Settings.getValue('video.ebook_mode.enabled').then((data) => {
        this.eBookModeSwitch.checked = data;
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

    handleEBookModeSwitch: function () {
      const value = this.eBookModeSwitch.checked;
      window.Settings.setValue('video.ebook_mode.enabled', value);
    }
  };

  Display.init();
})(window);
