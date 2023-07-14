const permissions = require('../permissions');

module.exports = {
  getValue: (name) => {
    return new Promise((resolve, reject) => {
      permissions.requestPermission("settings");
      permissions.permissionListener("settings", async (data) => {
        ipcRenderer.send("settings-getvalue", {
          name: name,
        });
        ipcRenderer.on("settings-getvalue-reply", (event, value) => {
          resolve(value);
        });
      });
    });
  },
  setValue: (name, value) => {
    permissions.requestPermission("settings");
    permissions.permissionListener("settings", async (data) => {
      ipcRenderer.send("settings-setvalue", {
        name: name,
        value: value,
      });
    });
  },
};
