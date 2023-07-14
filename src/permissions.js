const { ipcRenderer } = require("electron");
const api = require("./api");

module.exports = {
  checkPermission: async function (name) {
    // Code to read and parse the /manifest.webapp file
    // Modify this function as per your specific implementation
    const manifestUrl = `${location.origin}/manifest.json`;
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      throw new Error("Error: " + response.status);
    }
    const manifest = await response.json();

    // Check if the manifest contains the necessary permissions for storage operations
    if (manifest.permissions && manifest.permissions[name]) {
      return manifest.permissions[name];
    }

    return false;
  },

  requestPermission: function (name) {
    if (!this.checkPermission(name)) {
      return;
    }
    ipcRenderer.send("message", {
      type: "permission",
      name: name,
    });
  },

  permissionListener: function (name, callback) {
    if (!this.checkPermission(name)) {
      return;
    }
    ipcRenderer.once("message", function (data) {
      console.log(data);
      if (data.name !== name) {
        return;
      }
      callback(data);
    });
  },
};
