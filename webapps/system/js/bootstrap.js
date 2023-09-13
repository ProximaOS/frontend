!(function (exports) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const screen = document.getElementById('screen');

    Settings.addObserver('general.lang.code', (value) => {
      if (navigator.mozL10n.language.code !== value) {
        LoadingScreen.show();
        LoadingScreen.element.textContent = navigator.mozL10n.get('changingLanguage');
        LoadingScreen.element.addEventListener('transitionend', () => {
          navigator.mozL10n.language.code = value;
          LoadingScreen.hide();
        });
      }
    });

    Settings.addObserver(
      'video.dark_mode.enabled',
      (value) => {
        IPC.send('change-theme', value ? 'dark' : 'light');
      }
    );

    Settings
      .getValue('general.software_buttons.enabled')
      .then((value) => {
        screen.classList.toggle('software-buttons-enabled', value);
      });
    Settings.addObserver(
      'general.software_buttons.enabled',
      (value) => {
        screen.classList.toggle('software-buttons-enabled', value);
      }
    );

    Settings
      .getValue('video.warm_colors.enabled')
      .then((value) => {
        screen.classList.toggle('warm-colors', value);
      });
    Settings.addObserver(
      'video.warm_colors.enabled',
      (value) => {
        screen.classList.toggle('warm-colors', value);
      }
    );

    Settings
      .getValue('video.ebook_mode.enabled')
      .then((value) => {
        screen.classList.toggle('ebook', value);
      });
    Settings.addObserver(
      'video.ebook_mode.enabled',
      (value) => {
        screen.classList.toggle('ebook', value);
      }
    );

    window.AppsManager.getAll().then(() => {
      Splashscreen.hide();

      Settings.getValue('ftu.enabled').then((value) => {
        if (value) {
          LockscreenMotion.hideMotionElement();
          AppWindow.create(`http://ftu.localhost:${location.port}/manifest.json`, {});
        } else {
          Settings.getValue('homescreen.manifest_url').then((value) => {
            AppWindow.create(value, {});
          });
          Settings.addObserver('homescreen.manifest_url', (value) => {
            AppWindow.close('homescreen');
            AppWindow.create(value, {});
          });
        }
      });
    });
  });
})(window);
