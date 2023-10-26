(function () {
  'use strict';

  const { ipcRenderer } = require('electron');
  const fs = require('fs');
  const path = require('path');

  const memorySettings = {}; // Store settings in memory

  const Settings = {
    getValue: function (name, settingsFile = 'settings.json') {
      // Use in-memory settings if available
      if (memorySettings[name]) {
        return Promise.resolve(memorySettings[name]);
      }

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
      // Update in-memory settings
      memorySettings[name] = value;
      ipcRenderer.send('settingschange', { name, [name]: value });

      // Write to file system after "beforeunload" event
      window.addEventListener('beforeunload', () => {
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
                }
              );
            } catch (error) {
              console.error(error);
            }
          }
        );
      });
    },
    // Function to register an observer for a setting
    addObserver: function (name, callback) {
      ipcRenderer.on('settingschange', (event, data) => {
        if (data && data[name]) {
          callback(data[name]);
        }
      });
    }
  };

  module.exports = Settings;
})();
