!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const DownloadManager = {
    init: function () {
      ipcRenderer.on('downloadrequest', this.handleDownloadRequest.bind(this));
      ipcRenderer.on(
        'downloadprogress',
        this.handleDownloadProgress.bind(this)
      );
    },

    handleDownloadRequest: function (event, data) {
      NotificationToaster.showNotification(
        navigator.mozL10n.get('downloading'),
        {
          body: data.suggestedFilename
        }
      );
    },

    handleDownloadProgress: function (event, data) {
      NotificationToaster.showNotification(
        navigator.mozL10n.get('downloading'),
        {
          body: data.suggestedFilename,
          progress: data.progress * 100,
          tag: data.url
        }
      );
    }
  };

  DownloadManager.init();
})(window);
