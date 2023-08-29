!(function (exports) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const screen = document.getElementById('screen');

    _session.settings
      .getValue('general.software_buttons.enabled')
      .then((value) => {
        screen.classList.toggle('software-buttons-enabled', value);
      });
    _session.settings.addObserver(
      'general.software_buttons.enabled',
      (value) => {
        screen.classList.toggle('software-buttons-enabled', value);
      }
    );

    _session.settings.getValue('homescreen.manifest_url').then((value) => {
      AppWindow.create(value, {});
    });
    _session.settings.addObserver('homescreen.manifest_url', (value) => {
      AppWindow.create(value, {});
    });

    _session.appsManager.getAll().then(() => {
      Splashscreen.hide();

      _session.settings.getValue('ftu.enabled').then((value) => {
        if (value) {
          LockscreenMotion.hideMotionElement();
          AppWindow.create('http://ftu.localhost:8081/manifest.json', {});
        }
      });
    });
  });
})(window);
