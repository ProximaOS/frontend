!(function (exports) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const screen = document.getElementById('screen');

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

    window.Settings.getValue('homescreen.manifest_url').then((value) => {
      AppWindow.create(value, {});
    });
    window.Settings.addObserver('homescreen.manifest_url', (value) => {
      AppWindow.create(value, {});
    });

    window.AppsManager.getAll().then(() => {
      Splashscreen.hide();

      window.Settings.getValue('ftu.enabled').then((value) => {
        if (value) {
          LockscreenMotion.hideMotionElement();
          AppWindow.create('http://ftu.localhost:8081/manifest.json', {});
        }
      });
    });
  });
})(window);
