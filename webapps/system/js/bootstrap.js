!(function (exports) {
  'use strict';

  const Bootstrap = {
    screen: document.getElementById('screen'),

    settings: [
      'ftu.enabled',
      'general.lang.code',
      'general.software_buttons.enabled',
      'video.dark_mode.enabled',
      'video.reader_mode.enabled',
      'video.warm_colors.enabled'
    ],
    SETTINGS_FTU_ENABLED: 0,
    SETTINGS_GENERAL_LANG_CODE: 1,
    SETTINGS_GENERAL_SOFTWARE_BUTTONS: 2,
    SETTINGS_VIDEO_DARK_MODE: 3,
    SETTINGS_VIDEO_READER_MODE: 4,
    SETTINGS_VIDEO_WARM_COLORS: 5,

    init: function () {
      Settings.getValue(this.settings[this.SETTINGS_GENERAL_SOFTWARE_BUTTONS]).then(this.handleSoftwareButtons.bind(this));
      Settings.getValue(this.settings[this.SETTINGS_VIDEO_WARM_COLORS]).then(this.handleWarmColors.bind(this));
      Settings.getValue(this.settings[this.SETTINGS_VIDEO_READER_MODE]).then(this.handleReaderMode.bind(this));

      Settings.addObserver(this.settings[this.SETTINGS_GENERAL_LANG_CODE], this.handleLanguageChange.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_VIDEO_DARK_MODE], this.handleColorScheme.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_GENERAL_SOFTWARE_BUTTONS], this.handleSoftwareButtons.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_VIDEO_WARM_COLORS], this.handleWarmColors.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_VIDEO_READER_MODE], this.handleReaderMode.bind(this));

      AppsManager.getAll().then(() => {
        Settings.getValue(this.settings[this.SETTINGS_FTU_ENABLED]).then(this.handleFirstLaunch.bind(this));
        Splashscreen.hide();
      });
    },

    handleLanguageChange: function (value) {
      if (OrchidL10n.currentLanguage === value) {
        return;
      }

      LoadingScreen.show();
      LoadingScreen.element.textContent = navigator.mozL10n.get('changingLanguage');
      LoadingScreen.element.addEventListener('transitionend', () => {
        OrchidL10n.currentLanguage = value;
        LoadingScreen.element.textContent = navigator.mozL10n.get('changingLanguage');
        LoadingScreen.hide();
      });
    },

    handleColorScheme: function (value) {
      const targetTheme = value ? 'dark' : 'light';
      IPC.send('change-theme', targetTheme);
    },

    handleSoftwareButtons: function (value) {
      this.screen.classList.toggle('software-buttons-enabled', value);
    },

    handleWarmColors: function (value) {
      this.screen.classList.toggle('warm-colors', value);
    },

    handleReaderMode: function (value) {
      this.screen.classList.toggle('reader-mode', value);
    },

    handleFirstLaunch: function (value) {
      if (value) {
        LockscreenMotion.hideMotionElement();
        AppWindow.create(`http://ftu.localhost:${location.port}/manifest.json`, {});
      } else {
        LazyLoader.load('js/homescreen_launcher.js');
      }
    }
  };

  window.addEventListener('load', () => Bootstrap.init());
})(window);
