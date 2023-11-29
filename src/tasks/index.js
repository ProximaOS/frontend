!(function () {
  'use strict';

  const { webContents } = require('electron');

  module.exports = {
    getOSProcessMemoryInfo: function (webContentsId) {
      webContents.fromId(webContentsId);
    },

    clearHistory: function (webContentsId) {
      webContents.fromId(webContentsId).clearHistory();
    },

    forcefullyCrashRenderer: function (webContentsId) {
      webContents.fromId(webContentsId).forcefullyCrashRenderer();
    },

    getAllSharedWorkers: function (webContentsId) {
      webContents.fromId(webContentsId).getAllSharedWorkers();
    },

    getThrottle: function (webContentsId) {
      return webContents.fromId(webContentsId).getBackgroundThrottling();
    },

    setThrottle: function (webContentsId, enabled) {
      webContents.fromId(webContentsId).setBackgroundThrottling(enabled);
    }
  };
})();
