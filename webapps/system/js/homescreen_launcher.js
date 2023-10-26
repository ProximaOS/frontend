!(function (exports) {
  'use strict';

  const HomescreenLauncher = {
    settings: ['homescreen.manifest_url'],
    SETTINGS_HOMESCREEN_MANIFEST_URL: 0,

    init: function () {
      if (platform() === 'desktop') {
        return;
      }

      Settings.getValue(this.SETTINGS_HOMESCREEN_MANIFEST_URL).then(this.handleHomescreen.bind(this));
      Settings.addObserver(this.SETTINGS_HOMESCREEN_MANIFEST_URL, this.handleHomescreenChange.bind(this));
    },

    handleHomescreen: function (value) {
      console.log(value);
      AppWindow.create(value, {});
    },

    handleHomescreenChange: function (value) {
      console.log(value);
      AppWindow.close('homescreen');
      AppWindow.create(value, {});
    }
  };

  HomescreenLauncher.init();
})(window);
