!(function () {
  'use strict';

  module.exports = {
    checkPermission: async function (name) {
      const pattern = /^http:\/\/.*\.localhost:8081\//;
      if (pattern.test(location.href)) {
        return;
      }

      // Code to read and parse the /manifest.json file
      // Modify this function as per your specific implementation
      const manifestUrl = `${location.origin}/manifest.json`;
      const response = await fetch(manifestUrl);
      if (!response.ok) {
        throw new Error('Error: ' + response.status);
      }
      const manifest = await response.json();

      // Check if the manifest contains the necessary permissions for storage operations
      if (manifest.permissions && manifest.permissions[name]) {
        return manifest.permissions[name];
      }

      return false;
    }
  };
})();
