!(function (exports) {
  'use strict';

  const { ipcRenderer, contextBridge } = require('electron');

  const VisibilityState = {
    init: function () {
      ipcRenderer.on('visibilitystate', this.handleVisibilityState.bind(this));
    },

    handleVisibilityState: function (event, data) {
      this.visibility = data;
      console.log(data);

      const visibilityChangeEvent = new Event('visibilitychange');
      document.dispatchEvent(visibilityChangeEvent);
    }
  };

  contextBridge.exposeInMainWorld('getDocumentVisibilityState', () => {
    return VisibilityState.visibility;
  });

  VisibilityState.init();
})(window);
