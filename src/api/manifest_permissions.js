!(function () {
  'use strict';

  module.exports = {
    checkPermission: function (name) {
      if ((process && !navigator.userAgent.includes('OpenOrchid')) || location.protocol === 'orchid:') {
        return {};
      }

      // Code to read and parse the /manifest.json file
      // Modify this function as per your specific implementation
      const manifestUrl = `${location.origin}/manifest.json`;
      const xhr = new XMLHttpRequest();
      xhr.open('GET', manifestUrl, false); // The third parameter makes the request synchronous
      xhr.send();

      if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
      } else {
        throw new Error(`Request failed with status ${xhr.status}`);
      }
    }
  };
})();
