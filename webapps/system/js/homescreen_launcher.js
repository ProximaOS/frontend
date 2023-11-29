!(function (exports) {
  'use strict';

  const HomescreenLauncher = {
    settings: ['homescreen.manifest_url.mobile', 'homescreen.manifest_url.smart_tv'],
    SETTINGS_HOMESCREEN_MANIFEST_URL_MOBILE: 0,
    SETTINGS_HOMESCREEN_MANIFEST_URL_SMART_TV: 1,

    init: function () {
      if (platform() === 'desktop') {
        return;
      }

      if (platform() === 'smart-tv') {
        Settings.getValue(this.settings[this.SETTINGS_HOMESCREEN_MANIFEST_URL_SMART_TV]).then(this.handleHomescreen.bind(this));
        Settings.addObserver(this.settings[this.SETTINGS_HOMESCREEN_MANIFEST_URL_SMART_TV], this.handleHomescreenChange.bind(this));
      } else {
        Settings.getValue(this.settings[this.SETTINGS_HOMESCREEN_MANIFEST_URL_MOBILE]).then(this.handleHomescreen.bind(this));
        Settings.addObserver(this.settings[this.SETTINGS_HOMESCREEN_MANIFEST_URL_MOBILE], this.handleHomescreenChange.bind(this));
      }
    },

    handleHomescreen: function (value) {
      AppWindow.create(value, {});
      AppWindow.focus('homescreen');
    },

    handleHomescreenChange: function (value) {
      AppWindow.close('homescreen');
      AppWindow.create(value, {});
      AppWindow.focus('homescreen');
    }
  };

  HomescreenLauncher.init();
})(window);
