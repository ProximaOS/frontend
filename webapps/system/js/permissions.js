!(function (exports) {
  'use strict';

  const Permissions = {
    init: function () {
      window.addEventListener(
        'permissionrequest',
        this.handlePermissionRequest.bind(this)
      );
    },

    handlePermissionRequest: async function (event) {
      ModalDialog.showPermissionRequest(
        navigator.mozL10n.get(`permission-${event.detail.type}`),
        navigator.mozL10n.get(`permissionDetail-${event.detail.type}`),
        (decision) => {
          ipcRenderer.send('permissionrequest', {
            permission: event.detail.type,
            origin: event.detail.origin,
            decision
          });
        }
      );
    }
  };

  Permissions.init();
})(window);
