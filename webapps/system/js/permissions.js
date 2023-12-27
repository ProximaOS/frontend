!(function (exports) {
  'use strict';

  const Permissions = {
    init: function () {
      window.addEventListener('permissionrequest', this.handlePermissionRequest.bind(this));
    },

    handlePermissionRequest: async function (event) {
      const url = new URL(event.detail.origin);
      const settingId = `${url.origin}`;
      Settings.getValue(settingId, 'permissions.json').then((value) => {
        if (value && value[event.detail.type]) {
          IPC.send('permissionrequest', {
            permission: event.detail.type,
            origin: event.detail.origin,
            decision: value[event.detail.type]
          });
        } else {
          ModalDialog.showPermissionRequest(
            L10n.get(`permission-${event.detail.type}`),
            L10n.get(`permissionDetail-${event.detail.type}`),
            (decision) => {
              IPC.send('permissionrequest', {
                permission: event.detail.type,
                origin: event.detail.origin,
                decision
              });

              if (!value) {
                value = {};
              }
              value[event.detail.type] = decision;
              Settings.setValue(settingId, value, 'permissions.json');
            }
          );
        }
      });
    }
  };

  Permissions.init();
})(window);
