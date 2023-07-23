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

        appListJson.forEach(async function (app, index) {
          const response = await fetch(app.manifestUrl);
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

          if (index == appListJson.length - 1) {
            resolve(appListJson);
          }
        });
      } catch (error) {
        console.error("Error reading app list:", error);
        console.log("Creating a new webapps configuration file.");

        const webappsDir = process.env.OPENORCHID_WEBAPPS;
        const appList = fs.readdirSync(webappsDir).map((file) => {
          const appId = file || `{${v4()}}`;
          const installedAt = new Date().toISOString();
          const manifestUrl = `http://${appId}.localhost:${location.port}/manifest.json`;

          return { appId, installedAt, manifestUrl };
        });

        this.writeAppList(appList);
        return appList;
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
};
