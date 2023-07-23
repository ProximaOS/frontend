const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");
const { v4 } = require("uuid");

require("dotenv").config();

module.exports = {
  readAppList: function () {
    return new Promise((resolve, reject) => {
      try {
        const appListData = fs.readFileSync(
          process.env.OPENORCHID_WEBAPPS_CONF,
          "utf8"
        );
        const appListJson = JSON.parse(appListData);

        appListJson.forEach(async (app, index) => {
          let langCode;
          try {
            langCode = navigator.mozL10n.language.code || 'en-US';
          } catch (error) {
            // If an error occurs, set a default value for langCode
            langCode = 'en-US';
          }

          let manifestUrl;
          if (app.manifestUrl[langCode]) {
            manifestUrl = app.manifestUrl[langCode];
          } else {
            manifestUrl = app.manifestUrl['en-US'];
          }

          const response = await fetch(manifestUrl);
          const manifest = await response.json();

          if (manifest.icons) {
            Object.entries(manifest.icons).forEach((icon) => {
              manifest.icons[
                icon[0]
              ] = `http://${app.appId}.localhost:${location.port}${icon[1]}`;
            });
          }
          if (!manifest.role) {
            manifest.role = "webapp";
          }
          app.manifest = manifest;

          var size = this.getFolderSize(path.join(process.env.OPENORCHID_WEBAPPS, app.appId));
          app.size = size;

          if (index == appListJson.length - 1) {
            setTimeout(() => {
              resolve(appListJson);
            }, 10);
          }
        });
      } catch (error) {
        console.error("Error reading app list:", error);
        console.log("Creating a new webapps configuration file.");

        const webappsDir = process.env.OPENORCHID_WEBAPPS;
        const appList = fs.readdirSync(webappsDir).map((file) => {
          const appId = file || `{${v4()}}`;
          const installedAt = new Date().toISOString();
          var manifestUrl = {
            'en-US': `http://${appId}.localhost:${location.port}/manifest.json`
          };

          var webappAssets = fs.readdirSync(path.join(webappsDir, file));
          webappAssets.forEach((manifest) => {
            if (!manifest.startsWith('manifest.')) {
              return;
            }
            if (manifest == 'manifest.json') {
              return;
            }
            var langCode = manifest.split('.')[1];
            manifestUrl[langCode] = `http://${appId}.localhost:${location.port}/manifest.${langCode}.json`;
          });

          return { appId, installedAt, manifestUrl };
        });

        this.writeAppList(appList);
        console.log(appList);
        setTimeout(() => {
          resolve(appList);
        }, 10);
      }
    });
  },

  writeAppList: function (appList) {
    try {
      const appListData = JSON.stringify(appList, null, 2);
      fs.writeFileSync(
        process.env.OPENORCHID_WEBAPPS_CONF,
        appListData,
        "utf8"
      );
    } catch (error) {
      console.error("Error writing app list:", error);
    }
  },

  installApp: function (zipFilePath) {
    return new Promise((resolve, reject) => {
      const appId = v4();
      const appDir = path.join(process.env.OPENORCHID_WEBAPPS, `{${appId}}`);
      const appList = this.readAppList();

      fs.mkdirSync(appDir, { recursive: true });

      try {
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(appDir, true);

        const appEntry = {
          appId: `{${appId}}`,
          installedAt: new Date().toISOString(),
          manifestUrl: `http://{${appId}}.localhost:8081/manifest.json`,
        };

        appList.push(appEntry);
        this.writeAppList(appList);

        resolve(appId);
      } catch (error) {
        console.error("Error extracting app:", error);
        reject(error);
      }
    });
  },

  uninstallApp: function (appId) {
    const appDir = path.join(process.env.OPENORCHID_WEBAPPS, appId);
    const appList = this.readAppList();

    if (appList.hasOwnProperty(appId)) {
      delete appList.find((item) => item.appId === appId);
      this.writeAppList(appList);

      fs.rmdirSync(appDir, { recursive: true });
      console.log(`App with ID '${appId}' uninstalled.`);
    } else {
      console.error(`App with ID '${appId}' not found.`);
    }
  },

  getFolderSize: function (folderPath) {
    let totalSize = 0;

    function calculateSize(filePath) {
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        const nestedFiles = fs.readdirSync(filePath);

        nestedFiles.forEach((file) => {
          const nestedFilePath = path.join(filePath, file);
          calculateSize(nestedFilePath);
        });
      }
    }

    calculateSize(folderPath);

    // Convert the total size to a human-readable format (e.g., KB, MB, GB)
    const sizeInBytes = totalSize;
    const units = ['bytes', 'KB', 'MB', 'GB'];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size > 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    size = Math.round(size * 100) / 100; // Round to two decimal places

    return `${size} ${units[unitIndex]}`;
  }
};
