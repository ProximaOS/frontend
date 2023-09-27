!(function () {
  'use strict';

  module.exports = {
    checkPermission: function (name) {
      return new Promise((resolve, reject) => {
        if (process && !navigator.userAgent.includes('OpenOrchid')) {
          resolve({});
          return;
        }

        // Code to read and parse the /manifest.json file
        // Modify this function as per your specific implementation
        const manifestUrl = `${location.origin}/manifest.json`;
        fetch(manifestUrl).then((response) => {
          response.json().then((manifest) => {
            // Check if the manifest contains the necessary permissions for storage operations
            if (manifest.permissions && manifest.permissions[name]) {
              resolve(manifest.permissions[name]);
            } else {
              resolve(false);
            }
          });
        }).catch((error) => {
          throw new Error('Error: ' + error);
        });
      });
    }
  };
})();
