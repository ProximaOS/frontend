!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const DownloadManager = {
    init: function () {
      ipcRenderer.on('downloadrequest', this.handleDownloadRequest.bind(this));
      ipcRenderer.on('downloadprogress', this.handleDownloadProgress.bind(this));
    },

    handleDownloadRequest: function (event, data) {
      NotificationToaster.showNotification(navigator.mozL10n.get('downloading'), {
        body: `${data.suggestedFilename}\n${data.url}`
      });
    },

    handleDownloadProgress: function (event, data) {
      NotificationToaster.showNotification(navigator.mozL10n.get('downloading'), {
        body: `${data.suggestedFilename}\n${data.progress} - ${data.size} - ${data.lastModified}`,
        tag: data.url
      });
    }
  };

  DownloadManager.init();
})(window);
