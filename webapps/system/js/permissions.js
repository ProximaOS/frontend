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
      const settingId = `${event.detail.origin}@${event.detail.type}`;
      Settings.getValue(settingId).then((value) => {
        if (value) {
          IPC.send('permissionrequest', {
            permission: event.detail.type,
            origin: event.detail.origin,
            decision: value
          });
        } else {
          ModalDialog.showPermissionRequest(
            navigator.mozL10n.get(`permission-${event.detail.type}`),
            navigator.mozL10n.get(`permissionDetail-${event.detail.type}`),
            (decision) => {
              IPC.send('permissionrequest', {
                permission: event.detail.type,
                origin: event.detail.origin,
                decision
              });
              Settings.setValue(settingId, decision);
            }
          );
        }
      });
    }
  };

  Permissions.init();
})(window);
