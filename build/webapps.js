const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const glob = require('glob');

const sourceDir = './webapps';
const outputDir = './build_stage';

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Read the list of webapps in the source directory
const webapps = fs.readdirSync(sourceDir);

// Loop through each webapp and create a zip file
webapps.forEach((webapp) => {
  const webappPath = path.join(sourceDir, webapp);
  const zip = new AdmZip();

  const outputwebappPath = path.join(outputDir, webapp);
  if (!fs.existsSync(outputwebappPath)) {
    fs.mkdirSync(outputwebappPath);
  }

  const manifestFiles = glob.sync('manifest*.json', { cwd: path.join(sourceDir, webapp) });
  manifestFiles.forEach(file => {
    const sourcePath = path.join(sourceDir, webapp, file);
    const destPath = path.join(outputDir, webapp, file);
    fs.copyFileSync(sourcePath, destPath);
  });

  // Add the entire contents of the webapp directory to the zip
  zip.addLocalFolder(webappPath);

  // Save the zip file to the output directory
  const outputPath = path.join(outputDir, webapp, 'webapp.zip');
  zip.writeZip(outputPath);

  console.log(`webapp '${webapp}' zipped to '${outputPath}'`);
});

console.log('All webapps zipped successfully.');
