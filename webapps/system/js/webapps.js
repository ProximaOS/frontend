!(function (exports) {
  'use strict';

  const Webapps = {
    runningWebapps: [],

    append: function (data) {
      this.runningWebapps.push(data);
    },

    getWindowById: function (id) {
      let targetWindow;
      for (let index = 0, length = this.runningWebapps.length; index < length; index++) {
        const runningWebapp = this.runningWebapps[index];
        if (runningWebapp.namespaceID === id) {
          targetWindow = runningWebapp.appWindow;
        }
      }
      return targetWindow;
    }
  };

  exports.Webapps = Webapps;
})(window);
