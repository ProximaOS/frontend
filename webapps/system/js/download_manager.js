!(function (exports) {
  'use strict';

  const DownloadManager = {
    init: function () {
      window.addEventListener('downloadrequest', this.handleDownloadRequest.bind(this));
      window.addEventListener(
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
