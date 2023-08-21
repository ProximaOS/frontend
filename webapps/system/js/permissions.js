!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const Permissions = {
    init: function () {
      ipcRenderer.on(
        'permissionrequest',
        this.handlePermissionRequest.bind(this)
      );
    },

    handlePermissionRequest: async function (event, data) {
      ModalDialog.showConfirm(
        navigator.mozL10n.get(`permission-${data.type}`),
        navigator.mozL10n.get(`permissionDetail-${data.type}`),
        (decision) => {
          ipcRenderer.send('permissionrequest', {
            permission: type.permission,
            decision
          });
        }
      );
    }
  };

  Permissions.init();
})(window);
