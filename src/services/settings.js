(function () {
  'use strict';

  const fs = require('fs');
  const path = require('path');

  // Array to store observer functions
  const observers = {};

  module.exports = {
    getValue: (name) => {
      return new Promise((resolve, reject) => {
        fs.readFile(
          path.join(process.env.OPENORCHID_DATA, 'settings.json'),
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
    setValue: (name, value) => {
      fs.readFile(
        path.join(process.env.OPENORCHID_DATA, 'settings.json'),
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
              path.join(process.env.OPENORCHID_DATA, 'settings.json'),
              updatedSettings,
              'utf8',
              (error) => {
                if (error) {
                  console.error(error);
                } else {
                  // Notify all observers that the setting has changed
                  if (observers[name] && observers[name].length > 0) {
                    observers[name].forEach((observer) => observer(value));
                  }
                }
              }
            );
          } catch (error) {
            console.error(error);
          }
        }
      );
    },
    // Function to register an observer for a setting
    addObserver: (name, observer) => {
      if (!observers[name]) {
        observers[name] = [];
      }
      observers[name].push(observer);
    },
    // Function to remove an observer for a setting
    removeObserver: (name, observer) => {
      if (observers[name]) {
        observers[name] = observers[name].filter((obs) => obs !== observer);
      }
    }
  };
})();
