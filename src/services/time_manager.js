!(function (exports) {
  'use strict';

  module.exports = {
    getCurrentTime: () => {
      return new Promise((resolve, reject) => {
        _session.settings.getValue('date.iso_timedate').then((data) => {
          const currentDate = new Date().getTime();
          const savedDate = new Date(data).getTime();

          const estimate = currentDate - savedDate;
          const resultIsoString = savedDate + estimate;

          resolve(resultIsoString);
        });
      });
    },
    setTime: (newTime) => {
      _session.requestPermission('timemanager');
      _session.permissionListener('timemanager', (data) => {
        // Code to set the device time to the specified time
        // Modify this function as per your specific implementation
        _session.settings.setValue('date.iso_timedate', newTime);
      });
    }
  };
})(window);
