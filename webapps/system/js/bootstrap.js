!(function (exports) {
  'use strict';

  const Bootstrap = {
    screen: null,
    frimwareScreen: null,

    isFrimware: false,

    settings: [
      'audio.volume.music',
      'ftu.enabled',
      'general.lang.code',
      'general.software_buttons.enabled',
      'video.dark_mode.enabled',
      'video.reader_mode.enabled',
      'video.warm_colors.enabled'
    ],
    SETTINGS_AUDIO_VOLUME_MUSIC: 0,
    SETTINGS_FTU_ENABLED: 1,
    SETTINGS_GENERAL_LANG_CODE: 2,
    SETTINGS_GENERAL_SOFTWARE_BUTTONS: 3,
    SETTINGS_VIDEO_DARK_MODE: 4,
    SETTINGS_VIDEO_READER_MODE: 5,
    SETTINGS_VIDEO_WARM_COLORS: 6,

    init: function () {
      this.screen = document.getElementById('screen');
      this.frimwareScreen = document.getElementById('frimware');
      if (this.isFrimware) {
        this.frimwareScreen.classList.add('visible');
        LazyLoader.load('js/frimware/charging_battery_icon.js');
        LazyLoader.load('js/frimware/charging_battery_canvas.js');
        return;
      }

      Settings.getValue(this.settings[this.SETTINGS_GENERAL_LANG_CODE]).then(this.handleLanguage.bind(this));
      Settings.getValue(this.settings[this.SETTINGS_GENERAL_SOFTWARE_BUTTONS]).then(this.handleSoftwareButtons.bind(this));
      Settings.getValue(this.settings[this.SETTINGS_VIDEO_WARM_COLORS]).then(this.handleWarmColors.bind(this));
      Settings.getValue(this.settings[this.SETTINGS_VIDEO_READER_MODE]).then(this.handleReaderMode.bind(this));

      Settings.addObserver(this.settings[this.SETTINGS_AUDIO_VOLUME_MUSIC], this.handleMusicVolume.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_GENERAL_LANG_CODE], this.handleLanguageChange.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_VIDEO_DARK_MODE], this.handleColorScheme.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_GENERAL_SOFTWARE_BUTTONS], this.handleSoftwareButtons.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_VIDEO_WARM_COLORS], this.handleWarmColors.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_VIDEO_READER_MODE], this.handleReaderMode.bind(this));

      AppsManager.getAll().then(() => {
        LazyLoader.load('js/lockscreen/clock.js');
        LazyLoader.load('js/lockscreen/date.js');
        LazyLoader.load('js/lockscreen/login.js');
        LazyLoader.load('js/lockscreen/motion.js');
        LazyLoader.load('js/lockscreen/pin_lock.js');
        LazyLoader.load('js/remote/p2p.js');
        LazyLoader.load('js/achievements.js');
        LazyLoader.load('js/alarms_handler.js');
        LazyLoader.load('js/app_launcher.js');
        LazyLoader.load('js/drag_and_drop.js');
        LazyLoader.load('js/download_manager.js');
        LazyLoader.load('js/keybinds.js');
        LazyLoader.load('js/keyboards.js');
        LazyLoader.load('js/login_ui.js');
        LazyLoader.load('js/media_playback.js');
        LazyLoader.load('js/message_handler.js');
        LazyLoader.load('js/modal_dialog.js');
        LazyLoader.load('js/music_controller.js', () => {
          Settings.getValue(this.settings[this.SETTINGS_AUDIO_VOLUME_MUSIC]).then(this.handleMusicVolume.bind(this));
          Settings.getValue(this.settings[this.SETTINGS_FTU_ENABLED]).then(this.handleFirstLaunch.bind(this));

          MusicController.play('/resources/music/bg.mp3', true);
        });
        LazyLoader.load('js/permissions.js');
        LazyLoader.load('js/picture_in_picture.js');
        LazyLoader.load('js/platform_classifier.js');
        LazyLoader.load('js/privacy_indicators.js');
        LazyLoader.load('js/syncing_data.js');
        LazyLoader.load('js/text_selection.js');
        LazyLoader.load('js/tray_devices.js');
        LazyLoader.load('js/utility_tray.js');
        LazyLoader.load('js/utility_tray_motion.js');
        LazyLoader.load('js/webapps.js');

        if ('_os' in window) {
          _os.devices.ensureDevice();
        }

        if (navigator.hardwareConcurrency >= 2) {
          if (navigator.deviceMemory >= 2) {
            this.screen.classList.add('gpu-capable');
          }
        }

        Splashscreen.hide();
      });

      window.addEventListener('orchidserviceload', this.onServicesLoad.bind(this));
    },

    handleMusicVolume: function (value) {
      MusicController.setVolume(value / 100, 1);
    },

    handleLanguage: function (value) {
      L10n.currentLanguage = value;
    },

    handleLanguageChange: function (value) {
      if (L10n.currentLanguage === value) {
        return;
      }

      LoadingScreen.show();
      LoadingScreen.element.textContent = L10n.get('changingLanguage');
      LoadingScreen.element.addEventListener('transitionend', () => {
        L10n.currentLanguage = value;
        LoadingScreen.element.textContent = L10n.get('changingLanguage');
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
        const appWindow = new AppWindow('http://ftu.localhost:8081/manifest.json', {});
      } else {
        LazyLoader.load('js/homescreen_launcher.js');
      }
    },

    onServicesLoad: function (event) {
      if ('OrchidServices' in window) {
        OrchidServices.devices.ensureDevice();
      }
    }
  };

  window.addEventListener('load', () => Bootstrap.init());
})(window);
