!(function (exports) {
  'use strict';

  const Remote = {
    db: null,

    init: async function () {
      if ('OrchidServices' in window) {
        this.db = OrchidServices.realtime;

        const userId = await OrchidServices.userId();
        OrchidServices.get(`profile/${userId}`).then((data) => {
          if (!data || !data.devices) {
            return;
          }
          data.devices.forEach((device) => {
            const deviceId = device.token;
            this.receive(deviceId, this.handleRequests.bind(this));
          });
        });
      }
    },

    handleRequests: function (data) {
      alert(data);
    },

    send: async function (data) {
      const deviceId = await OrchidServices.devices.deviceId();
      this.db.set(`remote/${deviceId}`, data);
    },

    receive: async function (deviceId, callback) {
      const currentDeviceId = await OrchidServices.devices.deviceId();
      this.db.listen(`remote/${deviceId}`, (data) => {
        if (deviceId === currentDeviceId) {
          return;
        }
        if (!data) {
          return;
        }
        callback(data);
        this.db.set(`remote/${deviceId}`, null);
      });
    }
  };

  Remote.init();

  exports.Remote = Remote;
})(window);
