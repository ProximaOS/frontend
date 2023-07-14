module.exports = {
  getCurrentTime: () => {
    return new Promise((resolve, reject) => {
      api.settings.getValue("system.date").then((data) => {
        resolve(data);
      });
    });
  },
  setTime: (newTime) => {
    api.requestPermission("timemanager");
    api.permissionListener("timemanager", (data) => {
      // Code to set the device time to the specified time
      // Modify this function as per your specific implementation
      api.settings.setValue("system.date", newTime);
    });
  },
};
