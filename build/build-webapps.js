const fs = require('fs');
const { copySync } = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
const { glob } = require('glob');

module.exports = function (sourcePath, outputDir) {
  const ignoredFiles = ['node_modules', 'package-lock.json'];

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  } else {
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir);
  }

  // Read the list of webapps in the source directory
  glob(sourcePath).then((webapps) => {
    // Loop through each webapp and create a zip file
    webapps.forEach((webappPath) => {
      const parts = webappPath.split(/[\/\\]/);
      const webapp = parts[parts.length - 1];

      const zip = new AdmZip();

      const outputwebappPath = path.join(outputDir, path.dirname(webapp));
      if (!fs.existsSync(outputwebappPath)) {
        fs.mkdirSync(outputwebappPath);
      }

      const webappFiles = fs.readdirSync(path.join(webappPath));
      webappFiles.forEach((file) => {
        if (ignoredFiles.indexOf(file) === -1) {
          const sourcePathCopy = path.join(webappPath, file);
          const destPath = path.join(outputDir, webapp, file);
          try {
            copySync(sourcePathCopy, destPath);
          } catch (error) {
            console.error(error);
          }
        }
      });

      // Add all files and subdirectories from the webapp directory to the zip
      const filesToZip = fs.readdirSync(webappPath);
      filesToZip.forEach((file) => {
        if (ignoredFiles.indexOf(file) === -1) {
          const sourcePath = path.join(webappPath, file);
          if (fs.statSync(sourcePath).isDirectory()) {
            zip.addLocalFolder(sourcePath, file);
          } else {
            zip.addLocalFile(sourcePath, path.dirname(file));
          }
        }
      });

      // Save the zip file to the output directory
      const outputPath = path.join(outputDir, webapp, 'webapp.zip');
      zip.writeZip(outputPath);

      console.log(`webapp '${webapp}' zipped to '${outputPath}'`);
    });

    console.log('All webapps zipped successfully.');
  });
};
