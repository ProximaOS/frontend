(function () {
  'use strict';

  const { ipcRenderer } = require('electron');
  const fs = require('fs');
  const path = require('path');

  const memorySettings = {}; // Store settings in memory

  const Settings = {
    /**
     * Get a JSON settings property value from specified settings file.
     * @param {String} name
     * @param {String} settingsFile
     * @returns {Promise}
     */
    getValue: function (name, settingsFile = 'settings.json') {
      if (memorySettings[name]) {
        return Promise.resolve(memorySettings[name]);
      }

      return new Promise((resolve, reject) => {
        fs.readFile(path.join(process.env.ORCHID_APP_PROFILE, settingsFile), 'utf8', (error, data) => {
          if (error) {
            console.error(error);
            reject(error);
            return;
          }

          try {
            const settings = JSON.parse(data);
            resolve(settings[name]);
          } catch (parseError) {
            console.error(parseError);
            reject(parseError);
          }
        });
      });
    },

    /**
     * Set JSON settings property of specified settings file to a specified value.
     * @param {String} name
     * @param {*} value
     * @param {String} settingsFile
     * @returns {Promise}
     */
    setValue: function (name, value, settingsFile = 'settings.json') {
      memorySettings[name] = value;
      ipcRenderer.emit('settingschange', { name, [name]: value });
      ipcRenderer.send('settingschange', { name, [name]: value });

      window.addEventListener('beforeunload', () => {
        const settingsFilePath = path.join(process.env.ORCHID_APP_PROFILE, settingsFile);

        fs.readFile(settingsFilePath, 'utf8', (error, data) => {
          if (error) {
            console.error(error);
            return;
          }

          try {
            const settings = JSON.parse(data);
            settings[name] = value;
            const updatedSettings = JSON.stringify(Object.assign(settings, memorySettings), null, 2);

            // Ensure the directory exists before writing the file
            const settingsDir = path.dirname(settingsFilePath);
            fse.ensureDir(settingsDir, (dirError) => {
              if (dirError) {
                console.error(dirError);
                return;
              }

              fs.writeFile(settingsFilePath, updatedSettings, 'utf8', (writeError) => {
                if (writeError) {
                  console.error(writeError);
                }
              });
            });
          } catch (parseError) {
            console.error(parseError);
          }
        });
      });
    },

    /**
     * Listen to JSON settings property value changes
     *
     * It triggers everytime a webapp uses `Settings.setValue(name: String, value: any, settingsFile: String)`
     * @param {String} name
     * @param {*} callback
     */
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
