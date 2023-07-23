const fs = require('fs');
const path = require('path');
const permissions = require('../permissions');

module.exports = {
  getValue: (name) => {
    return new Promise((resolve, reject) => {
      permissions.requestPermission("settings");
      permissions.permissionListener("settings", (data) => {
        fs.readFile(path.join(process.env.OPENORCHID_DATA, 'settings.json'), 'utf8', (error, data) => {
          if (error) {
            console.error(error);
            reject(error);
            return;
          }
          const settings = JSON.parse(data);
          resolve(settings[name]);
        });
      });
    });
  },
  setValue: (name, value) => {
    permissions.requestPermission("settings");
    permissions.permissionListener("settings", (data) => {
      fs.readFile(path.join(process.env.OPENORCHID_DATA, 'settings.json'), 'utf8', (error, data) => {
        if (error) {
          console.error(error);
          return;
        }

        try {
          const settings = JSON.parse(data);
          settings[name] = value;
          const updatedSettings = JSON.stringify(settings, null, 2);

          fs.writeFile(path.join(process.env.OPENORCHID_DATA, 'settings.json'), updatedSettings, 'utf8', (error) => {
            if (error) {
              console.error(error);
            }
          });
        } catch (error) {
          console.error(error);
        }
      });
    });
  },
};
