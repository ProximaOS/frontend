!(function (exports) {
  'use strict';

  const HomescreenLauncher = {
    homescreenWindow: null,

    settings: ['homescreen.manifest_url.desktop', 'homescreen.manifest_url.mobile', 'homescreen.manifest_url.smart_tv'],
    SETTINGS_HOMESCREEN_MANIFEST_URL_DESKTOP: 0,
    SETTINGS_HOMESCREEN_MANIFEST_URL_MOBILE: 1,
    SETTINGS_HOMESCREEN_MANIFEST_URL_SMART_TV: 2,

    init: function () {
      if (window.deviceType === 'desktop') {
        return;
      }

      if (window.deviceType === 'desktop') {
        Settings.getValue(this.settings[this.SETTINGS_HOMESCREEN_MANIFEST_URL_DESKTOP]).then(this.handleHomescreen.bind(this));
        Settings.addObserver(this.settings[this.SETTINGS_HOMESCREEN_MANIFEST_URL_DESKTOP], this.handleHomescreenChange.bind(this));
      } else if (window.deviceType === 'smart-tv') {
        Settings.getValue(this.settings[this.SETTINGS_HOMESCREEN_MANIFEST_URL_SMART_TV]).then(this.handleHomescreen.bind(this));
        Settings.addObserver(this.settings[this.SETTINGS_HOMESCREEN_MANIFEST_URL_SMART_TV], this.handleHomescreenChange.bind(this));
      } else {
        Settings.getValue(this.settings[this.SETTINGS_HOMESCREEN_MANIFEST_URL_MOBILE]).then(this.handleHomescreen.bind(this));
        Settings.addObserver(this.settings[this.SETTINGS_HOMESCREEN_MANIFEST_URL_MOBILE], this.handleHomescreenChange.bind(this));
      }
    },

    handleHomescreen: function (value) {
      this.homescreenWindow = new AppWindow(value, {});
    },

    handleHomescreenChange: function (value) {
      this.homescreenWindow.close();
      this.homescreenWindow = new AppWindow(value, {});
    }
  };

  HomescreenLauncher.init();

  exports.HomescreenLauncher = HomescreenLauncher;
})(window);
