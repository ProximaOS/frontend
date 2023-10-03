(function () {
  'use strict';

  const { ipcRenderer } = require('electron');
  const fs = require('fs');
  const path = require('path');

  const Settings = {
    getValue: function (name, settingsFile = 'settings.json') {
      return new Promise((resolve, reject) => {
        fs.readFile(
          path.join(process.env.ORCHID_APP_PROFILE, settingsFile),
          'utf8',
          (error, data) => {
            if (error) {
              console.error(error);
              reject(error);
              return;
            }
            const settings = JSON.parse(data);
            resolve(settings[name]);
          }
        );
      });
    },
    setValue: function (name, value, settingsFile = 'settings.json') {
      fs.readFile(
        path.join(process.env.ORCHID_APP_PROFILE, settingsFile),
        'utf8',
        (error, data) => {
          if (error) {
            console.error(error);
            return;
          }

          try {
            const settings = JSON.parse(data);
            settings[name] = value;
            const updatedSettings = JSON.stringify(settings, null, 2);

            fs.writeFile(
              path.join(process.env.ORCHID_APP_PROFILE, settingsFile),
              updatedSettings,
              'utf8',
              (error) => {
                if (error) {
                  console.error(error);
                }
                ipcRenderer.send('settingschange', { name, [name]: value });
              }
            );
          } catch (error) {
            console.error(error);
          }
        }
      );
    },
    // Function to register an observer for a setting
    addObserver: function (name, callback) {
      ipcRenderer.on('settingschange', (event, data) => {
        Settings.getValue(name).then(data => {
          callback(data);
        });
        if (data && data[name]) {
          callback(data[name]);
        }
      });
    }
  };

  module.exports = Settings;
})();
