!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  document.addEventListener('DOMContentLoaded', function () {
    const screen = document.getElementById('screen');

    window.Settings.addObserver('general.lang.code', (value) => {
      if (navigator.mozL10n.language.code !== value) {
        LoadingScreen.show();
        LoadingScreen.element.textContent = navigator.mozL10n.get('changingLanguage');
        LoadingScreen.element.addEventListener('transitionend', () => {
          navigator.mozL10n.language.code = value;
          LoadingScreen.hide();
        });
      }
    });

    window.Settings.addObserver(
      'video.dark_mode.enabled',
      (value) => {
        ipcRenderer.send('change-theme', value ? 'dark' : 'light');
      }
    );

    window.Settings
      .getValue('general.software_buttons.enabled')
      .then((value) => {
        screen.classList.toggle('software-buttons-enabled', value);
      });
    window.Settings.addObserver(
      'general.software_buttons.enabled',
      (value) => {
        screen.classList.toggle('software-buttons-enabled', value);
      }
    );

    window.Settings
      .getValue('video.warm_colors.enabled')
      .then((value) => {
        screen.classList.toggle('warm-colors', value);
      });
    window.Settings.addObserver(
      'video.warm_colors.enabled',
      (value) => {
        screen.classList.toggle('warm-colors', value);
      }
    );

    window.Settings
      .getValue('video.ebook_mode.enabled')
      .then((value) => {
        screen.classList.toggle('ebook', value);
      });
    window.Settings.addObserver(
      'video.ebook_mode.enabled',
      (value) => {
        screen.classList.toggle('ebook', value);
      }
    );

    window.AppsManager.getAll().then(() => {
      Splashscreen.hide();

      window.Settings.getValue('ftu.enabled').then((value) => {
        if (value) {
          LockscreenMotion.hideMotionElement();
          AppWindow.create(`http://ftu.localhost:${location.port}/manifest.json`, {});
        } else {
          window.Settings.getValue('homescreen.manifest_url').then((value) => {
            AppWindow.create(value, {});
          });
          window.Settings.addObserver('homescreen.manifest_url', (value) => {
            AppWindow.create(value, {});
          });
        }
      });
    });
  });
})(window);
