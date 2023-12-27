!(function () {
  'use strict';

  const AdmZip = require('adm-zip');
  const fs = require('fs');
  const path = require('path');
  const { v4 } = require('uuid');
  const Settings = require('../settings');

  require('dotenv').config();

  const AppsManager = {
    getAll: function () {
      return new Promise(async (resolve, reject) => {
        try {
          let appListData = fs.readFileSync(process.env.OPENORCHID_WEBAPPS_CONF, 'utf8');
          let appListJson = JSON.parse(appListData);
          const currentLanguage = await Settings.getValue('general.lang.code');

          for (let index = 0, length = appListJson.length; index < length; index++) {
            const app = appListJson[index];
            let langCode;
            try {
              langCode = currentLanguage || 'en-US';
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

            if (!manifest.role) {
              manifest.role = 'webapp';
            }
            app.manifest = manifest;

            const size = AppsManager.getFolderSize(path.join(process.env.OPENORCHID_WEBAPPS, app.appId));
            app.size = size;

            if (index === appListJson.length - 1) {
              setTimeout(() => {
                resolve(appListJson);
                appListJson = null;
              }, 16);
            }
          }
          appListData = null;
        } catch (error) {
          console.error('Error reading app list:', error);
          console.log('Creating a new webapps configuration file.');

          const webappsDir = process.env.OPENORCHID_WEBAPPS;
          let appList = fs.readdirSync(webappsDir).map((file) => {
            const appId = file || v4();
            const installedAt = new Date().toISOString();
            const manifestUrl = {
              'en-US': `http://${appId}.localhost:${location.port}/manifest.json`
            };

            let webappAssets = fs.readdirSync(path.join(webappsDir, file));
            for (let index = 0, length = webappAssets.length; index < length; index++) {
              const manifest = webappAssets[index];
              if (!manifest.startsWith('manifest.')) {
                continue;
              }
              if (manifest === 'manifest.json') {
                continue;
              }
              const langCode = manifest.split('.')[1];
              manifestUrl[langCode] = `http://${appId}.localhost:${location.port}/manifest.${langCode}.json`;
            }
            webappAssets = null;

            return { appId, installedAt, manifestUrl };
          });

          AppsManager.writeAppList(appList);
          console.log(appList);
          setTimeout(() => {
            resolve(appList);
            appList = null;
          }, 16);
        }
      });
    },

    writeAppList: function (appList) {
      try {
        let appListData = JSON.stringify(appList, null, 2);
        fs.writeFileSync(process.env.OPENORCHID_WEBAPPS_CONF, appListData, 'utf8');
        appListData = null;
      } catch (error) {
        console.error('Error writing app list:', error);
      }
    },

    installPackage: function (zipFilePath) {
      return new Promise((resolve, reject) => {
        const appId = v4();
        const appDir = path.join(process.env.ORCHID_APP_PROFILE, 'webapps', `{${appId}}`);

        AppsManager.getAll().then((appList) => {
          fs.mkdirSync(appDir, { recursive: true });

          try {
            const zip = new AdmZip(path.join(process.env.OPENORCHID_STORAGE, zipFilePath));
            zip.extractAllTo(appDir, true);

            const appEntry = {
              appId: `{${appId}}`,
              installedAt: new Date().toISOString(),
              manifestUrl: `http://{${appId}}.localhost:8081/manifest.json`
            };

            appList.push(appEntry);
            AppsManager.writeAppList(appList);

            resolve(appId);
          } catch (error) {
            console.error('Error extracting app:', error);
            reject(error);
          }
        });
      });
    },

    uninstall: function (appId) {
      const appDir = path.join(process.env.OPENORCHID_WEBAPPS, appId);
      const appList = AppsManager.getAll();

      if (appList.indexOf(appId) !== -1) {
        delete appList.find((item) => item.appId === appId);
        AppsManager.writeAppList(appList);

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
      const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
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

  module.exports = AppsManager;
})();
