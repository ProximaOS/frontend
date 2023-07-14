module.exports = {
  scan: () => {
    return new Promise((resolve, reject) => {
      api.requestPermission("wifimanager");
      api.permissionListener("wifimanager", (data) => {
        // Code to check Wi-Fi status and return the result
        wifi.scan((error, networks) => {
          if (error) {
            console.error(error);
          }
          resolve(networks);
        });
      });
    });
  },
  getCurrentConnections: () => {
    return new Promise((resolve, reject) => {
      api.requestPermission("wifimanager");
      api.permissionListener("wifimanager", (data) => {
        // Code to check Wi-Fi status and return the result
        wifi.getCurrentConnections((error, currentConnections) => {
          if (error) {
            console.error(error);
          }
          resolve(currentConnections);
        });
      });
    });
  },
  enable: () => {
    api.requestPermission("wifimanager");
    api.permissionListener("wifimanager", (data) => {
      // Code to enable wifimanager
      wifi.init({
        iface: null, // Pass `null` to use the default network interface
      });

      wifi.scan((error, networks) => {
        if (error) {
          console.error(error);
          return;
        }

        const network = networks[0]; // Assuming the first network in the list is the desired one

        wifi.connect({ ssid: network.ssid }, (error) => {
          if (error) {
            console.error(error);
            return;
          }
        });
      });
    });
  },
  disable: () => {
    api.requestPermission("wifimanager");
    api.permissionListener("wifimanager", (data) => {
      // Code to disable wifimanager
      wifi.init({
        iface: null, // Pass `null` to use the default network interface
      });

      wifi.disconnect((error) => {
        if (error) {
          console.error(error);
        }
      });
    });
  },
  deleteConnection: (ssid) => {
    api.requestPermission("wifimanager");
    api.permissionListener("wifimanager", (data) => {
      // Code to delete a network
      wifi.deleteConnection({ ssid: ssid }, (error) => {
        if (error) {
          console.error(error);
        }
      });
    });
  },
};
