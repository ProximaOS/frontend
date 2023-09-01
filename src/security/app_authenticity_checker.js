const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

require('dotenv').config();

const webappsDir = process.env.OPENORCHID_WEBAPPS;

const SecurityChecker = {
  interval: 300,

  checkManifestFile: function (filePath) {
    try {
      const manifestData = require(filePath);

      if (
        !manifestData.name ||
        manifestData.name.trim() === '' ||
        (manifestData.developer &&
          (manifestData.developer.name.trim() === '' ||
            manifestData.developer.url.trim() === ''))
      ) {
        return true;
      }

      return false;
    } catch (error) {
      return false; // Ignore files with invalid JSON or missing 'manifest.json'
    }
  },

  findManifestFiles: function (dir) {
    const results = [];

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Check if the folder is a 'webapp' folder
        const webappManifestFiles = this.findManifestFiles(filePath);
        results.push(...webappManifestFiles);
      }
    }

    return results;
  },

  checkManifestSecurity: function () {
    const manifestFiles = this.findManifestFiles(webappsDir);

    if (manifestFiles.length === 0) {
      console.log('No manifest.json files found in the webapps folder.');
      // Send an event to the Electron main process for security threat
      ipcMain.emit('security-threat', { filePath, type: 'malware' });
    } else {
      console.log(
        'Checking manifest.json files for blank names or developers:'
      );
      manifestFiles.forEach((filePath, index) => {
        if (this.checkManifestFile(filePath)) {
          console.log(
            `File ${index + 1}: ${filePath} has a blank name or developer.`
          );
          // Send an event to the Electron main process for security threat
          ipcMain.emit('security-threat', { filePath, type: 'unauthenticity' });
        }
      });
    }
  },

  start: function () {
    this.checkManifestSecurity();
    this.intervalId = setInterval(() => {
      this.checkManifestSecurity();
    }, this.interval * 1000);
  },

  stop: function () {
    clearInterval(this.intervalId);
  },

  changeInterval: function (newInterval) {
    if (newInterval > 30) {
      this.stop(); // Stop the current interval
      this.interval = newInterval; // Update the interval duration
      this.start(); // Start with the new interval
    }
  }
};

// Start the periodic check with the default interval
SecurityChecker.start();

// Example usage to change the interval to 2 minutes (120 seconds)
// securityChecker.changeInterval(120);

module.exports = SecurityChecker;
